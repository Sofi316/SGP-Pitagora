import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import InputGroup from '../InputGroup/InputGroup';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Captura el token de la URL (?token=...)
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
            setError('Por favor, completa ambos campos.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                token: token,
                nuevaPassword: password
            });
            
            setMensaje('Contraseña restablecida con éxito. Redirigiendo al inicio de sesión...');
            
            setTimeout(() => {
                navigate('/'); // Redirige al login usando tu ruta raíz
            }, 3000);

        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('El enlace de recuperación es inválido o ha expirado.');
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
                        Ingresa tu nueva contraseña para actualizar las credenciales de seguridad de tu cuenta.
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

                    {mensaje && <p className={styles.successMessage}>{mensaje}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <div className={styles.formOptions}>
                        <Link to="/" className={styles.forgotPasswordLink}>Volver al inicio de sesión</Link>
                    </div>

                    {!invalidToken && (
                        <div className={styles.buttonContainer}>
                            <button type="submit" className={styles.pitagoraSubmitButton}>Actualizar Contraseña</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;