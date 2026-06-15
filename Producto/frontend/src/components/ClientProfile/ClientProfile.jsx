import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InputGroup from '../InputGroup/InputGroup';
import styles from './ClientProfile.module.css';
import { FaUser, FaIdCard, FaHardHat } from "react-icons/fa";

const ClientProfile = () => {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    celular: '',
    contrasenaNueva: '',
    contrasenaConfirmar: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editandoPassword, setEditandoPassword] = useState(false);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('No se pudo identificar al usuario.');
        return;
      }

      const response = await api.get(`/usuarios/${userId}`);
      setUsuario(response.data);
      setFormData({
        nombre: response.data.nombre || '',
        apellido: response.data.apellido || '',
        correo: response.data.correo || '',
        celular: response.data.celular || '',
        contrasenaNueva: '',
        contrasenaConfirmar: ''
      });
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('Ocurrió un error al cargar sus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.correo.trim() || !formData.celular.trim()) {
      setError('Nombre, apellido, correo y celular son obligatorios.');
      return;
    }

    if (editandoPassword) {
      if (!formData.contrasenaNueva || !formData.contrasenaConfirmar) {
        setError('Debe completar todos los campos de contraseña.');
        return;
      }
      if (formData.contrasenaNueva !== formData.contrasenaConfirmar) {
        setError('Las contraseñas nuevas no coinciden.');
        return;
      }
      if (formData.contrasenaNueva.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    try {
      const userId = localStorage.getItem('userId');
      
      // 1. Payload limpiado para evitar errores de Spring Security
      const payload = {
        id: usuario.id,
        rut: usuario.rut,
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        celular: formData.celular,
        cargo: usuario.cargo,
        recibe_notificaciones: usuario.recibe_notificaciones,
        activo: usuario.activo,
        rol: { id: usuario.rol?.id },
        obras: usuario.obras?.map(o => ({ id: o.id })) || []
      };

      if (editandoPassword && formData.contrasenaNueva) {
        payload.contrasena = formData.contrasenaNueva;
      }

      // 2. Guardamos la respuesta
      const response = await api.put(`/usuarios/${userId}`, payload);
      
      // 3. Refrescamos el JWT en LocalStorage con la nueva info
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', formData.correo);
      }

      setSuccess('Perfil actualizado exitosamente.');
      setEditandoPassword(false);
      setFormData(prev => ({
        ...prev,
        contrasenaNueva: '',
        contrasenaConfirmar: ''
      }));
      
      cargarDatosUsuario();
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data || 'Ocurrió un error al actualizar el perfil.');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>Cargando perfil...</p>
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Mi Perfil</h1>
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.obraNombre}>{usuario.nombre} {usuario.apellido}</h2>
            <span className={`${styles.badge} ${usuario.activo ? styles.badgeActiva : styles.badgeInactiva}`}>
              {usuario.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaUser /> Información del Usuario</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <InputGroup
                  label="Nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <InputGroup
                  label="Apellido"
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <InputGroup
                  label="Correo Electrónico"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <InputGroup
                  label="Celular"
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.readOnlySection}>
              <p className={styles.detailText}><strong>RUT:</strong> {usuario.rut}</p>
              <p className={styles.detailText}><strong>Cargo:</strong> {usuario.cargo || 'N/A'}</p>
            </div>

            <div className={styles.obrasSection}>
              <h4 className={styles.subSectionTitle}><FaHardHat /> Obras Asignadas</h4>
              {usuario.obras && usuario.obras.length > 0 ? (
                <ul className={styles.listObras}>
                  {usuario.obras.map(obra => (
                    <li key={obra.id} className={styles.detailText}>{obra.nombre}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noObras}>No tiene obras asignadas actualmente.</p>
              )}
            </div>
            
            <div className={styles.passwordSection}>
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setEditandoPassword(!editandoPassword)}
              >
                {editandoPassword ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
              </button>

              {editandoPassword && (
                <div className={styles.passwordFields}>
                  <div className={styles.formGroup}>
                    <InputGroup
                      label="Nueva Contraseña"
                      type="password"
                      name="contrasenaNueva"
                      value={formData.contrasenaNueva}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <InputGroup
                      label="Confirmar Nueva Contraseña"
                      type="password"
                      name="contrasenaConfirmar"
                      value={formData.contrasenaConfirmar}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitBtn}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfile;