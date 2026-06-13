import React, { useState } from 'react';
import api from '../../services/api';
import styles from './UsuariosAdmin.module.css';

const ModalEliminarUsuario = ({ isOpen, onClose, usuario, onSuccess }) => {
  const [backendError, setBackendError] = useState('');

  if (!isOpen || !usuario) return null;

  const handleEliminar = async () => {
    const currentUserEmail = localStorage.getItem('userEmail') || '';
    if (usuario.correo === currentUserEmail) {
      setBackendError('Excepción de Auto-eliminación: No puedes desactivar tu propia cuenta.');
      return;
    }

    try {
      await api.delete(`/usuarios/${usuario.id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setBackendError(err.response?.data?.message || 'Error al desactivar usuario.');
    }
  };

  const sOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const sContent = { backgroundColor: '#fff', padding: '25px', borderRadius: '4px', width: '400px', maxWidth: '90%', textAlign: 'center', color: '#333' };
  const sError = { color: '#d9534f', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' };

  return (
    <div style={sOverlay}>
      <div style={sContent}>
        <h3 style={{ margin: '0 0 15px 0', color: '#d9534f' }}>Confirmar Eliminación</h3>
        <p>¿Estás seguro que deseas desactivar al usuario <strong>{usuario.nombre} {usuario.apellido}</strong>?</p>
        <p style={{ fontSize: '12px', color: '#777', marginBottom: '15px' }}>Se mantendrá en el histórico, pero no podrá acceder ni recibir correos.</p>
        {backendError && <p style={sError}>{backendError}</p>}
        
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <button onClick={() => { setBackendError(''); onClose(); }} className={styles.btnSecondaryModal}>Cancelar</button>
          <button onClick={handleEliminar} className={styles.deleteBtn}>Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarUsuario;