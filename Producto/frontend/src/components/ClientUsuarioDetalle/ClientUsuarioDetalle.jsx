import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ClientUsuarioDetalle.module.css';
import { FaUser, FaIdCard, FaHardHat } from "react-icons/fa";

const ClientUsuarioDetalle = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', correo: '', celular: '', contrasena: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (e) {
      return null;
    }
  };

  const cargarDatos = async () => {
    const id = getUserIdFromToken();
    if (!id) {
      setError('No se pudo identificar la sesión del usuario.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get(`/usuarios/${id}`);
      setUsuario(response.data);
    } catch (err) {
      setError('Error al cargar la información de la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      celular: usuario.celular || '',
      contrasena: '' 
    });
    setFormErrors({});
    setBackendError('');
    setShowModal(true);
  };

  const formatCelular = (valor) => {
    let value = valor.replace(/[^0-9+]/g, '');
    if (value.length > 0 && !value.startsWith('+')) value = '+' + value;
    if (value.length > 3 && !value.startsWith('+569')) {
      value = '+569' + value.replace('+569', '').replace('+', '');
    }
    return value.slice(0, 12); 
  };

  const validarForm = () => {
    const errores = {};
    if (!formData.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) errores.apellido = 'El apellido es obligatorio.';
    
    if (!formData.correo.trim()) {
      errores.correo = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errores.correo = 'Formato de correo electrónico inválido.';
    }

    if (formData.celular && !/^\+569[0-9]{8}$/.test(formData.celular)) {
      errores.celular = 'Formato inválido: +569XXXXXXXX';
    }

    if (formData.contrasena && formData.contrasena.length < 4) {
      errores.contrasena = 'La contraseña debe tener al menos 4 caracteres.';
    }

    setFormErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarForm()) return;

    setSubmitLoading(true);
    setBackendError('');

    try {
      // 1. Limpiamos el payload para evitar errores de deserialización en Spring Boot (Jackson)
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

      if (formData.contrasena && formData.contrasena.trim() !== '') {
        payload.contrasena = formData.contrasena;
      }

      // 2. Guardamos la respuesta para extraer el token actualizado
      const res = await api.put(`/usuarios/${usuario.id}`, payload);
      
      // 3. Sincronizamos el nuevo JWT en localStorage
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userEmail', formData.correo);
      }

      setShowModal(false);
      setSuccessMessage('Sus datos fueron actualizados correctamente.');
      cargarDatos();
      
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setBackendError(err.response?.data?.message || err.response?.data || 'Error al actualizar los datos.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const sOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const sContent = { backgroundColor: '#fff', padding: '25px', borderRadius: '4px', width: '650px', color: '#333', maxHeight: '95vh', overflowY: 'auto' };
  const sGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '5px' };
  const sGroup = { display: 'flex', flexDirection: 'column', minHeight: '85px' };
  const sLabel = { fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#555' };
  const sInput = (err) => ({ padding: '10px', borderRadius: '2px', border: err ? '2px solid #d9534f' : '1px solid #ccc', fontSize: '14px', outline: 'none' });
  const sError = { color: '#d9534f', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' };
  const sBtnSubmit = { backgroundColor: '#0d3b66', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' };
  const sBtnCancel = { backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' };

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: '#fff', fontSize: '18px' }}>Cargando datos de la cuenta...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: '#ffcccc', fontSize: '18px' }}>{error}</p>
      </div>
    );
  }
  
  if (!usuario) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Mi Cuenta</h1>
        </div>
      </div>

      {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
            <div>
                <h2 className={styles.userName}>{usuario.nombre} {usuario.apellido}</h2>
            </div>
            <div className={styles.actions}>
                <button className={styles.editBtn} onClick={handleOpenModal}>Editar</button>
            </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaIdCard /> Información Personal</h3>
            <p className={styles.detailText}><strong>RUT:</strong> {usuario.rut}</p>
            <p className={styles.detailText}><strong>Correo:</strong> {usuario.correo}</p>
            <p className={styles.detailText}><strong>Celular:</strong> {usuario.celular || 'N/A'}</p>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaUser /> Cargo</h3>
            <p className={styles.detailText}><strong>Cargo:</strong> {usuario.cargo || 'N/A'}</p>
          </div>

          <div className={styles.sectionCard} style={{ gridColumn: '1 / -1' }}>
            <h3 className={styles.sectionTitleIcons}><FaHardHat /> Obras Asignadas</h3>
            {usuario.obras && usuario.obras.length > 0 ? (
              <ul className={styles.listObras}>
                {usuario.obras.map(obra => (
                  <li key={obra.id} className={styles.detailText}>
                    {obra.nombre} <span style={{ color: '#6c757d', fontStyle: 'italic', marginLeft: '5px' }}>({obra.empresaCliente?.razonSocial || 'Sin empresa'})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noObras}>No tienes obras asignadas actualmente.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={sOverlay}>
          <div style={sContent}>
            <h3 style={{margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333'}}>Editar Usuario</h3>
            
            {backendError && (
              <p style={{ color: '#d9534f', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>
                {backendError}
              </p>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <div style={sGrid}>
                <div style={sGroup}>
                  <label style={sLabel}>Nombre</label>
                  <input type="text" style={sInput(formErrors.nombre)} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  {formErrors.nombre && <span style={sError}>{formErrors.nombre}</span>}
                </div>
                
                <div style={sGroup}>
                  <label style={sLabel}>Apellido</label>
                  <input type="text" style={sInput(formErrors.apellido)} value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                  {formErrors.apellido && <span style={sError}>{formErrors.apellido}</span>}
                </div>

                <div style={sGroup}>
                  <label style={sLabel}>Correo Electrónico</label>
                  <input type="email" style={sInput(formErrors.correo)} value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} />
                  {formErrors.correo && <span style={sError}>{formErrors.correo}</span>}
                </div>

                <div style={sGroup}>
                  <label style={sLabel}>Celular</label>
                  <input type="text" style={sInput(formErrors.celular)} value={formData.celular} onChange={e => setFormData({...formData, celular: formatCelular(e.target.value)})} />
                  {formErrors.celular && <span style={sError}>{formErrors.celular}</span>}
                </div>

                <div style={sGroup}>
                  <label style={sLabel}>Nueva Contraseña (Opcional)</label>
                  <input type="password" placeholder="Dejar en blanco para mantener" style={sInput(formErrors.contrasena)} value={formData.contrasena} onChange={e => setFormData({...formData, contrasena: e.target.value})} />
                  {formErrors.contrasena && <span style={sError}>{formErrors.contrasena}</span>}
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                <button type="button" onClick={() => setShowModal(false)} style={sBtnCancel} disabled={submitLoading}>Cancelar</button>
                <button type="submit" style={{...sBtnSubmit, opacity: submitLoading ? 0.6 : 1}} disabled={submitLoading}>
                  {submitLoading ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientUsuarioDetalle;