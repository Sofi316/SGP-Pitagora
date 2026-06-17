import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaInvitado = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol'); 

  if (token) {
    
    if (rol === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    } else if (rol === 'CLIENTE') {
        return <Navigate to="/cliente" replace />;
    }
    
    
    localStorage.clear();
    return children;
  }

  return children;
};

export default RutaInvitado;