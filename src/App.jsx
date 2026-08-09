import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Placeholders for Admin Pages
const AdminDashboard = () => <div className="p-8">Admin Dashboard</div>;

// Placeholders for Student Pages
const StudentDashboard = () => <div className="p-8">Student Dashboard</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            
            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* Other admin routes will go here */}
            </Route>

            {/* Student Routes */}
            <Route element={<StudentRoute />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              {/* Other student routes will go here */}
            </Route>
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
