import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './UsuariosAdmin.module.css';

const ModalEditarUsuario = ({ isOpen, onClose, usuarioOriginal, roles, todasLasObras, onSuccess }) => {
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [backendError, setBackendError] = useState('');

  useEffect(() => {
    if (usuarioOriginal) {
      setUsuarioAEditar({
        ...usuarioOriginal,
        rolIdForm: usuarioOriginal.rol?.id || '',
        obrasIdsForm: usuarioOriginal.obras?.map(o => o.id) || [],
        nuevaContrasena: ''
      });
      setFormErrors({});
      setBackendError('');
    }
  }, [usuarioOriginal, isOpen]);

  if (!isOpen || !usuarioAEditar) return null;

  const validarRutChileno = (rutCompleto) => {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto)) return false;
    const tmp = rutCompleto.split('-');
    let digv = tmp[1].toUpperCase();
    const rut = tmp[0];
    let M = 0, S = 1;
    let T = parseInt(rut, 10);
    for (; T; T = Math.floor(T / 10)) {
      S = (S + T % 10 * (9 - M++ % 6)) % 11;
    }
    const dvEsperado = S ? S - 1 : 'K';
    return dvEsperado.toString() === digv;
  };

  const formatRut = (rut) => {
    let value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (value.length > 1) value = value.slice(0, -1) + '-' + value.slice(-1);
    return value;
  };

  const formatCelular = (valor) => {
    let value = valor.replace(/[^0-9+]/g, '');
    if (value.length > 0 && !value.startsWith('+')) value = '+' + value;
    if (value.length > 3 && !value.startsWith('+569')) {
      value = '+569' + value.replace('+569', '').replace('+', '');
    }
    return value.slice(0, 12); 
  };

  const validarFormulario = (datos) => {
    const errores = {};
    if (!datos.rut) errores.rut = 'El RUT es obligatorio.';
    else if (!validarRutChileno(datos.rut)) errores.rut = 'Formato de RUT inválido.';
    
    if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
    if (!datos.apellido) errores.apellido = 'El apellido es obligatorio.';
    
    if (!datos.correo) errores.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) errores.correo = 'Correo inválido.';
    
    if (!datos.rolIdForm) errores.rolId = 'Debe seleccionar un rol.';

    if (datos.celular && !/^\+569[0-9]{8}$/.test(datos.celular)) {
      errores.celular = 'Formato inválido: +569XXXXXXXX';
    }

    return errores;
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    const errores = validarFormulario(usuarioAEditar);
    if (Object.keys(errores).length > 0) {
      setFormErrors(errores);
      return;
    }

    try {
      const payload = { 
        ...usuarioAEditar, 
        rol: { id: parseInt(usuarioAEditar.rolIdForm) },
        obras: usuarioAEditar.obrasIdsForm.map(id => ({ id: parseInt(id) }))
      };
      
      if (usuarioAEditar.nuevaContrasena) {
        payload.contrasena = usuarioAEditar.nuevaContrasena;
      } else {
        delete payload.contrasena;
      }

      await api.put(`/usuarios/${usuarioAEditar.id}`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setBackendError(err.response?.data?.message || 'Conflicto de Correo: El email ya pertenece a otra cuenta.');
    }
  };

  const toggleObraSelection = (id) => {
    const current = usuarioAEditar.obrasIdsForm || [];
    const nuevo = current.includes(id) ? current.filter(oid => oid !== id) : [...current, id];
    setUsuarioAEditar({ ...usuarioAEditar, obrasIdsForm: nuevo });
  };

  const sOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const sContent = { backgroundColor: '#fff', padding: '25px', borderRadius: '4px', width: '650px', maxWidth: '90%', color: '#333', maxHeight: '95vh', overflowY: 'auto' };
  const sGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '5px' };
  const sGroup = { display: 'flex', flexDirection: 'column', minHeight: '85px' };
  const sLabel = { fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#555' };
  const sInput = (err) => ({ padding: '10px', borderRadius: '2px', border: err ? '2px solid #d9534f' : '1px solid #ccc', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' });
  const sError = { color: '#d9534f', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' };
  const sBtnSubmit = { backgroundColor: '#0d3b66', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' };

  return (
    <div style={sOverlay}>
      <div style={sContent}>
        <h3 style={{margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Editar Usuario</h3>
        {backendError && <p style={sError}>{backendError}</p>}
        
        <form onSubmit={handleEditar} noValidate>
          <div style={sGrid}>
            <div style={sGroup}>
              <label style={sLabel}>RUT</label>
              <input type="text" style={sInput(formErrors.rut)} value={usuarioAEditar.rut} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, rut: formatRut(e.target.value)})} />
              {formErrors.rut && <span style={sError}>{formErrors.rut}</span>}
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Cargo</label>
              <input type="text" style={sInput()} value={usuarioAEditar.cargo || ''} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, cargo: e.target.value})} />
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Nombre</label>
              <input type="text" style={sInput(formErrors.nombre)} value={usuarioAEditar.nombre} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, nombre: e.target.value})} />
              {formErrors.nombre && <span style={sError}>{formErrors.nombre}</span>}
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Apellido</label>
              <input type="text" style={sInput(formErrors.apellido)} value={usuarioAEditar.apellido} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, apellido: e.target.value})} />
              {formErrors.apellido && <span style={sError}>{formErrors.apellido}</span>}
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Correo Electrónico</label>
              <input type="email" style={sInput(formErrors.correo)} value={usuarioAEditar.correo} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, correo: e.target.value})} />
              {formErrors.correo && <span style={sError}>{formErrors.correo}</span>}
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Celular</label>
              <input type="text" style={sInput(formErrors.celular)} value={usuarioAEditar.celular || ''} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, celular: formatCelular(e.target.value)})} />
              {formErrors.celular && <span style={sError}>{formErrors.celular}</span>}
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Nueva Contraseña (Opcional)</label>
              <input type="password" placeholder="Dejar en blanco para mantener" style={sInput(formErrors.contrasena)} value={usuarioAEditar.nuevaContrasena || ''} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, nuevaContrasena: e.target.value})} />
              {formErrors.contrasena && <span style={sError}>{formErrors.contrasena}</span>}
            </div>
            <div style={sGroup}>
              <label style={sLabel}>Rol del Sistema</label>
              <select style={sInput(formErrors.rolId)} value={usuarioAEditar.rolIdForm || ''} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, rolIdForm: e.target.value})}>
                <option value="">-- Seleccione --</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {formErrors.rolId && <span style={sError}>{formErrors.rolId}</span>}
            </div>
          </div>

          <div style={{margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input type="checkbox" checked={usuarioAEditar.recibe_notificaciones} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, recibe_notificaciones: e.target.checked})} />
            <label style={{fontSize: '14px'}}>Recibir Notificaciones</label>
          </div>
          
          <div>
            <label style={sLabel}>Obras Asignadas</label>
            <div style={{maxHeight: '100px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '2px', background: '#f9f9f9'}}>
              {todasLasObras.map(o => (
                <div key={o.id} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0'}}>
                  <input type="checkbox" checked={(usuarioAEditar.obrasIdsForm || []).includes(o.id)} onChange={() => toggleObraSelection(o.id)} />
                  <span style={{fontSize: '13px'}}>{o.nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
            <button type="button" onClick={onClose} className={styles.btnSecondaryModal}>Cancelar</button>
            <button type="submit" style={sBtnSubmit}>Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;