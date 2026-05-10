import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();
  const TIEMPO_INACTIVIDAD = 30 * 60 * 1000; 

  const cerrarSesionInactividad = useCallback(() => {
    localStorage.clear(); 
    navigate('/login?expired=true'); 
  }, [navigate]);

  useEffect(() => {
    let timer;

    const reiniciarContador = () => {
      if (timer) clearTimeout(timer);
  
      if (localStorage.getItem('token')) {
        timer = setTimeout(cerrarSesionInactividad, TIEMPO_INACTIVIDAD);
      }
    };

 
    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    eventos.forEach(event => window.addEventListener(event, reiniciarContador));
    reiniciarContador(); 

    return () => {
      if (timer) clearTimeout(timer);
      eventos.forEach(event => window.removeEventListener(event, reiniciarContador));
    };
  }, [cerrarSesionInactividad]);

  return <>{children}</>;
};

export default AutoLogout;