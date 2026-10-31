import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Member 1 Components
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProfilePage,
  UserManagementPage,
  CustomerPortalLayout,
  ProtectedRoute,
} from '@members/member1/frontend/index.js';

// Member 2 Components
import {
  ProductsPage,
  ProductDetailsPage,
  PlansPage,
  TaxManagementPage,
  DiscountManagementPage,
} from '@members/member2/frontend/index.js';

// Member 3 Components
import {
  SubscriptionsPage,
  CreateSubscriptionPage,
  SubscriptionDetailsPage,
  QuotationsPage,
  CreateQuotationPage,
  QuotationTemplatesPage,
} from '@members/member3/frontend/index.js';

// Member 4 Components
import {
  FinanceDashboard,
  InvoicesPage,
  InvoiceDetailsPage,
  InvoicePDF,
  PaymentsPage,
  PaymentDetailsPage,
  RevenueAnalytics,
  OverdueInvoicesPage,
} from '@members/member4/frontend/index.js';

import { AdminLayout } from '../layouts/AdminLayout.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Customer Portal Layout (For customers directly) */}
      <Route
        path="/portal/*"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
            <CustomerPortalLayout />
          </ProtectedRoute>
        }
      />

      {/* Protected Staff & Admin Routes Wrapped in AdminLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <FinanceDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/revenue-analytics"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <RevenueAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Subscriptions Routes (Member 3) */}
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <SubscriptionsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <CreateSubscriptionPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <SubscriptionDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Quotations Routes (Member 3) */}
      <Route
        path="/quotations"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <QuotationsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <CreateQuotationPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotation-templates"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <QuotationTemplatesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Invoices & Payments Routes (Member 4) */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <InvoicesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <InvoiceDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id/print"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <InvoicePDF />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <PaymentsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <PaymentDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/overdue-invoices"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <OverdueInvoicesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Products, Plans, Taxes, Discounts (Member 2) */}
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <ProductsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <ProductDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <PlansPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/taxes"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <TaxManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/discounts"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <AdminLayout>
              <DiscountManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Administration & Profile (Member 1) */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout>
              <UserManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'CUSTOMER']}>
            <AdminLayout>
              <ProfilePage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
