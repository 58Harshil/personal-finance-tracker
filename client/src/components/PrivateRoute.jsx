import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isSignedIn = localStorage.getItem('isSignedIn') === 'true';

  return isSignedIn ? children : <Navigate to="/sign-in" />;
};

export default PrivateRoute;