import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import InputGroup from '../InputGroup/InputGroup';
import styles from './LoginPanel.module.css';

const LoginPanel = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensajeInfo, setMensajeInfo] = useState(''); 
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setMensajeInfo('Sesión cerrada por inactividad. Por favor, identifíquese de nuevo.');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeInfo('');

    if (!correo.trim() || !contrasena) {
      setError('Por favor, ingrese sus credenciales.');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        correo: correo.trim(),
        contrasena
      });

      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        const rolUsuario = response.data.nombreRol || response.data.rol;
        localStorage.setItem('rol', rolUsuario);
        localStorage.setItem('userEmail', correo.trim());

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.userId) {
            localStorage.setItem('userId', payload.userId);
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }

        if (rolUsuario === 'ADMIN') {
          // AQUÍ SE ACTUALIZÓ LA RUTA AL DASHBOARD
          navigate('/admin/dashboard');
        } else if (rolUsuario === 'CLIENTE') {
          navigate('/cliente');
        } else {
          navigate('/inicio');
        }
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const mensajeBackend = typeof data === 'string' ? data : JSON.stringify(data);

        if (status === 400 || mensajeBackend.includes('POR_FAVOR_INGRESE_SUS_CREDENCIALES')) {
          setError('Por favor, ingrese sus credenciales.');
        } else if (status === 403 || mensajeBackend.includes('CUENTA_INACTIVA')) {
          setError('Cuenta inactiva, contacte al administrador.');
        } else if (status === 404 || mensajeBackend.includes('USUARIO_NO_ENCONTRADO')) {
          setError('El correo ingresado no existe en nuestros registros.');
        } else if (status === 401 || mensajeBackend.includes('CREDENCIALES_INVALIDAS')) {
          setError('La contraseña ingresada es incorrecta.');
        } else {
          setError('Error de autenticación. Intente más tarde.');
        }
      } else {
        setError('No se pudo establecer conexión con el sistema.');
      }
    }
  };

  return (
    <div className={styles.loginPanelContainer}>
      <div className={styles.loginWelcomeBanner}>
        <h2 className={styles.loginWelcomeTitle}>Bienvenido al Sistema de Postventa</h2>
        <p className={styles.loginWelcomeSubtitle}>Constructora Pitagora</p>
        <p className={styles.loginWelcomeText}>
          Para subir una nueva solicitud debe ingresar con sus credenciales provistas en su correo electrónico.
        </p>
      </div>
      
      <div className={styles.loginPanelBox}>
        <div className={styles.titleContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
            </svg>
            <h3 className={styles.loginTitle} style={{ margin: 0 }}>Inicio de Sesión</h3>
          </div>
        </div>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputsContainer}>
            {mensajeInfo && (
              <p style={{
                color: '#364a5e', 
                backgroundColor: '#aec4d6', 
                padding: '12px', 
                borderRadius: '4px', 
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: '15px',
                border: '1px solid #7e9ab2'
              }}>
                {mensajeInfo}
              </p>
            )}

            <InputGroup
              label="Correo Electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              name="correo"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a3a62" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              }
            />
            <InputGroup
              label="Contraseña"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              name="contrasena"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a3a62" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '15px',
              textAlign: 'center',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <Link to="/recuperar" className={styles.forgotPasswordLink}>
            ¿Olvidó su contraseña?
          </Link>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.pitagoraSubmitButton}>
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPanel;