// src/components/AdminDashboardWrapper.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../auth/AuthService';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

function AdminDashboardWrapper() {
  const user = AuthService.getCurrentUser();

  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" />;
  } else if (user.role === 'admin') {
    // User is an admin, render the AdminDashboard
    return <AdminDashboard />;
  } else {
    // User is not an admin, render the UserDashboard
    return <UserDashboard />;
  }
}

export default AdminDashboardWrapper;
