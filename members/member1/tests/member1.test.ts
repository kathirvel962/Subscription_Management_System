import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../backend/authService.js';
import { UserService } from '../backend/userService.js';
import { validatePasswordStrength } from '../../../shared/utils/index.js';

describe('MEMBER 1: Authentication & User Management Tests', () => {
  const testEmail = `test_${Date.now()}@acme.com`;
  const validPassword = 'Secure@Pass123';

  it('validates password requirements correctly', () => {
    // Too short (<= 8)
    expect(validatePasswordStrength('Short1!').isValid).toBe(false);
    // Missing uppercase
    expect(validatePasswordStrength('nouppercase123!').isValid).toBe(false);
    // Missing lowercase
    expect(validatePasswordStrength('NOLOWERCASE123!').isValid).toBe(false);
    // Missing special character
    expect(validatePasswordStrength('NoSpecialChar123').isValid).toBe(false);
    // Valid password
    expect(validatePasswordStrength(validPassword).isValid).toBe(true);
  });

  it('registers a new customer successfully', async () => {
    const res = await AuthService.register({
      email: testEmail,
      password: validPassword,
      name: 'Test Customer',
      companyName: 'Acme Test Corp',
    });

    expect(res).toBeDefined();
    expect(res.user.email).toBe(testEmail.toLowerCase());
    expect(res.user.role).toBe('CUSTOMER');
    expect(res.token).toBeDefined();
    expect(res.customerProfile).toBeDefined();
  });

  it('prevents duplicate email registration', async () => {
    await expect(
      AuthService.register({
        email: testEmail,
        password: validPassword,
        name: 'Duplicate Test',
      })
    ).rejects.toThrow(/already exists/i);
  });

  it('logs in successfully with valid credentials', async () => {
    const res = await AuthService.login(testEmail, validPassword);
    expect(res.token).toBeDefined();
    expect(res.user.email).toBe(testEmail.toLowerCase());
  });

  it('rejects login with invalid password', async () => {
    await expect(AuthService.login(testEmail, 'WrongPassword@99')).rejects.toThrow(
      /invalid email or password/i
    );
  });

  it('admin can create internal staff account', async () => {
    const staffEmail = `staff_${Date.now()}@brightloop.io`;
    const staff = await UserService.createStaff({
      email: staffEmail,
      password: validPassword,
      name: 'Operations Staff',
      phone: '+91 99999 88888',
    });

    expect(staff.email).toBe(staffEmail.toLowerCase());
    expect(staff.role).toBe('STAFF');
  });

  it('handles forgot password and reset token flow', async () => {
    const forgotRes = await AuthService.forgotPassword(testEmail);
    expect(forgotRes.devToken).toBeDefined();

    const newPassword = 'NewSecret@Pass456';
    const resetRes = await AuthService.resetPassword(forgotRes.devToken!, newPassword);
    expect(resetRes.message).toContain('successfully');

    // Confirm login with new password works
    const loginRes = await AuthService.login(testEmail, newPassword);
    expect(loginRes.token).toBeDefined();
  });
});
