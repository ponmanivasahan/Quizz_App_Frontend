import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StudentRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'student') {
    return <Navigate to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login'} replace />;
  }

  return children ? children : <Outlet />;
};

export default StudentRoute;
