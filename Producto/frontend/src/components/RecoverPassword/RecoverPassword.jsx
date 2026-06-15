import React, { useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import InputGroup from '../InputGroup/InputGroup';
import styles from './RecoverPassword.module.css';

const RecoverPassword=()=>{
    const [correo,setCorreo] =useState('');
    const [mensaje, setMensaje]= useState('');
    const [error, setError]= useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!correo.trim()) {
          setError('Por favor, ingresa tu correo electrónico.');
          return;
        } else if (!emailRegex.test(correo)) {
          setError('Por favor, ingresa un formato de correo válido.');
          return;
        }
        try{
            await api.post(`/auth/solicitar-recuperacion?correo=${correo}`);
            setMensaje('Si el correo existe en nuestro sistema, te hemos enviado un enlace para recuperar tu contraseña.');

        } catch (err) {
            if (err.response?.status === 403) {
                // Cuenta desactivada
                setError(err.response?.data?.message || err.response?.data || 'Su cuenta está desactivada. Por favor, contacte con un administrador para reactivarla.');
            } else if (err.response?.status === 404) {
                // Correo no encontrado en la base de datos
                // Intenta capturar el texto enviado por Spring Boot, o usa el fallback literal
                setError(err.response?.data?.message || err.response?.data || 'El correo electrónico no existe en el sistema.');
            } else {
                setError('Ocurrió un error al intentar enviar el correo de recuperación.');
            }
        }
    };
    return(
       <div className={styles.loginPanelContainer}>
        <div className={styles.loginPanelBox}>
         
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.titleContainer}>
            <h2 className={styles.loginTitle}>Recuperar Clave</h2>
          </div>
          <p className={styles.instructionsText}>
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña
          </p>

          <InputGroup
            label="Correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            name="correo"
          />

          {mensaje && <p className={styles.successMessage}>{mensaje}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.formOptions}>
            <Link to="/" className={styles.forgotPasswordLink}>Volver al inicio de sesión</Link>
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.pitagoraSubmitButton}>Enviar Enlace</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RecoverPassword;

