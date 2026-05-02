import React, { useState } from 'react';
import axios from 'axios';
import InputGroup from '../InputGroup/InputGroup';
import styles from './LoginPanel.module.css';
import { Link } from 'react-router-dom';
const LoginPanel = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

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
        alert("¡Login exitoso! Token guardado.");
        // Aquí luego agregaremos: navigate('/dashboard');
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
          
          {/* NUEVO CONTENEDOR PARA RODEAR CORREO Y CONTRASEÑA */}
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