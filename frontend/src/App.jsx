
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Login from './pages/Login/Login';
import AdminLayout from './components/Layout/AdminLayout';
import Users from './pages/Admin/Users';
import AdminDashboard from './pages/Admin/Dashboard';
import Residents from './pages/Admin/Residents';
import AccessLogs from './pages/Admin/AccessLogs';
import GuardLayout from './components/Layout/GuardLayout';
import GuardDashboard from './pages/Guard/Dashboard';
import ResidentLayout from './components/Layout/ResidentLayout';
import ResidentDashboard from './pages/Resident/Dashboard';

// Placeholder Pages (will be replaced later)
// const GuardDashboard = () => <div>Guard Dashboard</div>;
// const ResidentDashboard = () => <div>Resident Dashboard</div>;
const Unauthorized = () => <div>Unauthorized</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="residents" element={<Residents />} />
            <Route path="logs" element={<AccessLogs />} />
          </Route>
        </Route>

        {/* Guard Routes */}
        <Route path="/guard" element={
          <ProtectedRoute allowedRoles={['guard']}>
            <GuardLayout />
          </ProtectedRoute>
        } >
          <Route index element={<GuardDashboard />} />
        </Route>

        {/* Resident Routes */}
        <Route path="/resident" element={
          <ProtectedRoute allowedRoles={['resident']}>
            <ResidentLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ResidentDashboard />} />
          {/* Redirect default to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
