import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Operational Pages
import Dashboard from './pages/dashboard/Dashboard';
import ProductsPlaceholder from './pages/products/ProductsPlaceholder';
import PlansPlaceholder from './pages/plans/PlansPlaceholder';
import SubscriptionsPlaceholder from './pages/subscriptions/SubscriptionsPlaceholder';
import InvoicesPlaceholder from './pages/invoices/InvoicesPlaceholder';
import PaymentsPlaceholder from './pages/payments/PaymentsPlaceholder';
import DiscountsPlaceholder from './pages/discounts/DiscountsPlaceholder';
import UsersPage from './pages/customers/UsersPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Member 2: Products & Plans (Admin & Staff) */}
            <Route
              path="products"
              element={
                <RoleRoute allowedRoles={['admin', 'staff']}>
                  <ProductsPlaceholder />
                </RoleRoute>
              }
            />
            <Route
              path="plans"
              element={
                <RoleRoute allowedRoles={['admin', 'staff']}>
                  <PlansPlaceholder />
                </RoleRoute>
              }
            />

            {/* Member 3: Subscriptions & Invoices (Role-aware) */}
            <Route path="subscriptions" element={<SubscriptionsPlaceholder />} />
            <Route path="invoices" element={<InvoicesPlaceholder />} />

            {/* Member 4: Payments & Discounts */}
            <Route path="payments" element={<PaymentsPlaceholder />} />
            <Route
              path="discounts"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <DiscountsPlaceholder />
                </RoleRoute>
              }
            />

            {/* User & Customer Management (Admin & Staff) */}
            <Route
              path="customers"
              element={
                <RoleRoute allowedRoles={['admin', 'staff']}>
                  <UsersPage />
                </RoleRoute>
              }
            />

            <Route path="settings" element={<Dashboard />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
