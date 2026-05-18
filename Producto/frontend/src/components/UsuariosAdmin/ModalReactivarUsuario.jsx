import React, { useState } from 'react';
import api from '../../services/api';
import styles from './UsuariosAdmin.module.css';

const ModalReactivarUsuario = ({ isOpen, onClose, mensaje, formData, onSuccess }) => {
  const [backendError, setBackendError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReactivar = async () => {
    setLoading(true);
    setBackendError('');
    
    try {
      const payload = {
        rut: formData.rut,
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        contrasena: formData.contrasena,
        celular: formData.celular,
        cargo: formData.cargo,
        recibe_notificaciones: formData.recibe_notificaciones,
        activo: true,
        rol: { id: parseInt(formData.rolId) },
        obras: formData.obrasIds.map(id => ({ id: parseInt(id) }))
      };
      
      await api.put(`/usuarios/reactivar/${formData.rut}`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setBackendError(err.response?.data?.message || err.response?.data || 'Error al reactivar cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const sOverlay = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000 
  };
  
  const sContent = { 
    backgroundColor: '#fff', 
    padding: '25px', 
    borderRadius: '4px', 
    width: '450px', 
    textAlign: 'center', 
    color: '#333' 
  };
  
  const sError = { 
    color: '#d9534f', 
    fontSize: '12px', 
    marginTop: '10px', 
    fontWeight: 'bold' 
  };

  return (
    <div style={sOverlay}>
      <div style={sContent}>
        <h3 style={{ margin: '0 0 15px 0', color: '#0d3b66' }}>Reactivar Usuario</h3>
        <p style={{ marginBottom: '15px' }}>{mensaje}</p>
        <p style={{ fontSize: '12px', color: '#777', marginBottom: '15px' }}>
          El usuario será reactivado con los nuevos datos ingresados.
        </p>
        {backendError && <p style={sError}>{backendError}</p>}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
          <button
            onClick={() => { setBackendError(''); onClose(); }}
            className={styles.btnSecondaryModal}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleReactivar}
            style={{
              backgroundColor: '#0d3b66',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Reactivando...' : 'Reactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalReactivarUsuario;
