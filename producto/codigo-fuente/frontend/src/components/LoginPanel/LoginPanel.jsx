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

    if (!correo || !contrasena) {
      setError('Por favor, ingrese sus credenciales.');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        correo,
        contrasena
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        const rolUsuario = response.data.nombreRol || response.data.rol;
        localStorage.setItem('rol', rolUsuario);

        if (rolUsuario === 'ADMIN') {
          navigate('/admin');
        } else if (rolUsuario === 'CLIENTE') {
          navigate('/dashboard');
        } else {
          navigate('/inicio');
        }
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const mensajeBackend = error.response.data;

        if (status === 403 || (mensajeBackend && typeof mensajeBackend === 'string' && mensajeBackend.includes("desactivada"))) {
          setError('Su cuenta se encuentra desactivada. Contacte al administrador.');
        } else if (status === 401) {
          setError('La contraseña ingresada es incorrecta.');
        } else if (status === 404) {
          setError('El correo ingresado no existe en nuestros registros.');
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
      <div className={styles.loginPanelBox}>
        <div className={styles.titleContainer}>
          <h2 className={styles.loginTitle}>Inicio de Sesión</h2>
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
            />
            <InputGroup
              label="Contraseña"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              name="contrasena"
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