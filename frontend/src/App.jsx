import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Login from './pages/Login/Login';

const AdminDashboard = () => <div>Admin Dashboard</div>;
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
          <Route path="/admin/*" element={<AdminDashboard />} />
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
