import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import InputGroup from '../InputGroup/InputGroup';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [invalidToken, setInvalidToken] = useState(false);

    useEffect(() => {
        if (!token) {
            setInvalidToken(true);
            setError('Falta el token de validación necesario para cambiar la contraseña.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!password.trim() || !confirmPassword.trim()) {
            setError('Error: Los campos no pueden estar vacíos.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña es demasiado corta. Debe tener al menos 6 caracteres.');
            return;
        }

        try {
            await api.post('/auth/reset-password', {
                token: token,
                nuevaPassword: password
            });
            
            setMensaje('Contraseña actualizada con éxito. Redirigiendo...');
            
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError('El link de recuperación ha expirado o ya fue utilizado.');
                setInvalidToken(true);
            } else {
                setError('Ocurrió un error al intentar actualizar la contraseña.');
            }
        }
    };

    return (
        <div className={styles.loginPanelContainer}>
            <div className={styles.loginPanelBox}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <div className={styles.titleContainer}>
                        <h2 className={styles.loginTitle}>Restablecer Clave</h2>
                    </div>
                    
                    <p className={styles.instructionsText}>
                        Ingresa tu nueva contraseña para actualizar las credenciales de acceso de tu cuenta.
                    </p>

                    {!invalidToken && (
                        <>
                            <InputGroup
                                label="Nueva Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                name="password"
                            />

                            <InputGroup
                                label="Confirmar Contraseña"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                name="confirmPassword"
                            />
                        </>
                    )}

                    {mensaje && (
                        <p style={{
                            color: '#155724',
                            backgroundColor: '#d4edda',
                            padding: '10px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            {mensaje}
                        </p>
                    )}
                    
                    {error && (
                        <p style={{
                            color: '#721c24',
                            backgroundColor: '#f8d7da',
                            padding: '10px',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </p>
                    )}

                    <div className={styles.formOptions}>
                        <Link to="/" className={styles.forgotPasswordLink}>Volver al inicio de sesión</Link>
                    </div>

                    {!invalidToken && !mensaje && (
                        <div className={styles.buttonContainer}>
                            <button type="submit" className={styles.pitagoraSubmitButton}>
                                Actualizar Contraseña
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;