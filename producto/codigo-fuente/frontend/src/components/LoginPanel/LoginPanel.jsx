import React, { useState } from 'react';
import axios from 'axios';
import InputGroup from '../InputGroup/InputGroup';
import styles from './LoginPanel.module.css';

const LoginPanel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
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
          
          {/* NUEVO CONTENEDOR PARA RODEAR EMAIL Y CONTRASEÑA */}
          <div className={styles.inputsContainer}>
            <InputGroup
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
            />
            <InputGroup
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
            />
          </div>

          <a href="/recuperar" className={styles.forgotPasswordLink}>
            Recuperar contraseña
          </a>

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