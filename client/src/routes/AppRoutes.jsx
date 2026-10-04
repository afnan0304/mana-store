import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import InventoryListPage from '../features/inventory/InventoryListPage';
import ItemDetailPage from '../features/inventory/ItemDetailPage';
import PeoplePage from '../features/people/PeoplePage';
import TransactionsPage from '../features/transactions/TransactionsPage';
import OverduePage from '../features/transactions/OverduePage';
import AuditLogsPage from '../features/dashboard/AuditLogsPage';
import ReportsPage from '../features/reports/ReportsPage';
import CategoriesPage from '../features/catalog/CategoriesPage';
import MaintenancePage from '../features/maintenance/MaintenancePage';
import ItemFormPage from '../features/inventory/ItemFormPage';
import BorrowerProfilePage from '../features/people/BorrowerProfilePage';
import SettingsPage from '../features/settings/SettingsPage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard & Operations Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="items" element={<InventoryListPage />} />
          <Route path="items/new" element={<ItemFormPage />} />
          <Route path="items/:id/edit" element={<ItemFormPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="inventory" element={<Navigate to="/items" replace />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="people/:id" element={<BorrowerProfilePage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="overdue" element={<OverduePage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
