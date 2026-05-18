import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  
  const TIEMPO_INACTIVIDAD = 15 * 60 * 1000; 

  const cerrarSesionInactividad = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.clear();
      navigate('/?expired=true', { replace: true });
    }
  }, [navigate]);

  const reiniciarContador = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const token = localStorage.getItem('token');
    
    if (token && location.pathname !== '/') {
      timerRef.current = setTimeout(cerrarSesionInactividad, TIEMPO_INACTIVIDAD);
    }
  }, [cerrarSesionInactividad, location.pathname, TIEMPO_INACTIVIDAD]);

  useEffect(() => {
    const eventos = [
      'mousedown', 
      'mousemove', 
      'keypress', 
      'scroll', 
      'touchstart',
      'click'
    ];

    eventos.forEach(event => window.addEventListener(event, reiniciarContador));
    
    reiniciarContador();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      eventos.forEach(event => window.removeEventListener(event, reiniciarContador));
    };
  }, [reiniciarContador]);

  return <>{children}</>;
};

export default AutoLogout;