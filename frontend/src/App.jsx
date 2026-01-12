
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Login from './pages/Login/Login';
import AdminLayout from './components/Layout/AdminLayout';
import Users from './pages/Admin/Users';
import AdminDashboard from './pages/Admin/Dashboard';
import Residents from './pages/Admin/Residents';
import AccessLogs from './pages/Admin/AccessLogs';

// Placeholder Pages (will be replaced later)
const GuardDashboard = () => <div>Guard Dashboard</div>;
const ResidentDashboard = () => <div>Resident Dashboard</div>;
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

        <Route element={<ProtectedRoute allowedRoles={['guard']} />}>
          <Route path="/guard/*" element={<GuardDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
          <Route path="/resident/*" element={<ResidentDashboard />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
