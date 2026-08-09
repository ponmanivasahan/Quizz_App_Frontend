import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to={user ? (user.role === 'student' ? '/student/dashboard' : '/login') : '/login'} replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
