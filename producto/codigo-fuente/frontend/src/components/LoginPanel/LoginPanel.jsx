import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import InputGroup from '../InputGroup/InputGroup';
import styles from './LoginPanel.module.css';

const LoginPanel = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        correo,
        contrasena
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        const rolUsuario = response.data.nombreRol || response.data.rol;

        if (rolUsuario === 'ADMIN') {
          navigate('/admin');
        } else if (rolUsuario === 'CLIENTE') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Credenciales incorrectas');
      } else {
        setError('Error al conectar con el servidor');
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
            <InputGroup
              label="Correo"
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

          {error && <p className={styles.errorMessage} style={{color: 'red', textAlign: 'center'}}>{error}</p>}

          <Link to="/recuperar" className={styles.forgotPasswordLink}>
          Recuperar contraseña
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