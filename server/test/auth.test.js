/**
 * SubscriptIQ Member 1 Foundation & Auth Test Suite
 * Tests all required authentication, validation, RBAC, and security endpoints.
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_SECRET = 'test_secret_for_subscriptiq_2026';

const { app, startServer } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

let server;
let baseUrl;

// Helper to make JSON HTTP requests
const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, text: rawData });
          }
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

test.before(async () => {
  server = await startServer();
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (server) {
    server.close();
  }
  await disconnectDB();
});

test.describe('SubscriptIQ Auth & Foundation Tests', () => {
  let customerToken = '';
  let customerId = '';
  let adminToken = '';
  let staffToken = '';

  test('1. API Health Check endpoint responds', async () => {
    const res = await makeRequest('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'online');
  });

  test('2. Password validation: rejects password without uppercase/special char/length', async () => {
    const weak1 = await makeRequest('POST', '/api/auth/register', {
      name: 'Weak User',
      email: 'weak1@test.com',
      password: 'short' // <= 8
    });
    assert.strictEqual(weak1.status, 400);

    const weak2 = await makeRequest('POST', '/api/auth/register', {
      name: 'Weak User',
      email: 'weak2@test.com',
      password: 'password123' // no uppercase, no special char
    });
    assert.strictEqual(weak2.status, 400);
  });

  test('3. Customer Registration with valid data succeeds & returns customer role', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Customer',
      email: 'cust1@brightloop.com',
      password: 'Password@1234'
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'customer');
    assert.strictEqual(res.body.data.user.password, undefined); // password not exposed

    customerToken = res.body.data.token;
    customerId = res.body.data.user._id;
  });

  test('4. Duplicate Email rejection', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      name: 'Duplicate Cust',
      email: 'cust1@brightloop.com',
      password: 'Password@1234'
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  test('5. Login with incorrect password returns 401', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'cust1@brightloop.com',
      password: 'WrongPassword@1'
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('6. Login with correct credentials returns JWT and safe user object', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'cust1@brightloop.com',
      password: 'Password@1234'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'cust1@brightloop.com');
  });

  test('7. Protected route: GET /api/auth/me verifies valid token', async () => {
    const res = await makeRequest('GET', '/api/auth/me', null, customerToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.email, 'cust1@brightloop.com');
  });

  test('8. Admin login with seeded credentials', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@brightloop.com',
      password: 'Admin@12345!'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.user.role, 'admin');
    adminToken = res.body.data.token;
  });

  test('9. Admin creates a new staff account via POST /api/users', async () => {
    const res = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'New Staff Rep',
        email: 'rep1@brightloop.com',
        password: 'Staff@12345!',
        role: 'staff'
      },
      adminToken
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.user.role, 'staff');
  });

  test('10. Non-admin (Customer) cannot create staff accounts (403 Forbidden)', async () => {
    const res = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Illicit Staff',
        email: 'illicit@brightloop.com',
        password: 'Staff@12345!',
        role: 'staff'
      },
      customerToken
    );

    assert.strictEqual(res.status, 403);
  });

  test('11. Customer cannot list all users via GET /api/users (403 Forbidden)', async () => {
    const res = await makeRequest('GET', '/api/users', null, customerToken);
    assert.strictEqual(res.status, 403);
  });

  test('12. Customer can view their own profile by ID, but not other users', async () => {
    // Access own ID
    const ownRes = await makeRequest('GET', `/api/users/${customerId}`, null, customerToken);
    assert.strictEqual(ownRes.status, 200);
    assert.strictEqual(ownRes.body.data.user._id, customerId);

    // Try accessing another user's ID
    const otherRes = await makeRequest('GET', `/api/users/600000000000000000000001`, null, customerToken);
    assert.strictEqual(otherRes.status, 403);
  });
});
