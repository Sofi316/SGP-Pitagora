import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './UsuariosAdmin.module.css';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [todasLasObras, setTodasLasObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroObraId, setFiltroObraId] = useState('');
  const [keyword, setKeyword] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [backendError, setBackendError] = useState('');

  const [formCrear, setFormCrear] = useState({
    rut: '', nombre: '', apellido: '', correo: '', contrasena: '', 
    celular: '', cargo: '', recibe_notificaciones: true, rolId: '', 
    obrasIds: []
  });

  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

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

  const validarFormulario = (datos, esEdicion = false) => {
    const errores = {};
    if (!datos.rut) errores.rut = 'El RUT es obligatorio.';
    else if (!validarRutChileno(datos.rut)) errores.rut = 'RUT inválido.';
    
    if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
    if (!datos.apellido) errores.apellido = 'El apellido es obligatorio.';
    
    if (!datos.correo) errores.correo = 'El correo es obligatorio.';
    else if (!datos.correo.includes('@')) errores.correo = 'Correo inválido.';
    
    if (!esEdicion && (!datos.contrasena || datos.contrasena.length < 4)) {
      errores.contrasena = 'La contraseña debe tener al menos 4 caracteres.';
    }

    if (!esEdicion && !datos.rolId) errores.rolId = 'Debe seleccionar un rol.';
    if (esEdicion && !datos.rolIdForm) errores.rolId = 'Debe seleccionar un rol.';

    if (datos.celular && !/^\+569[0-9]{8}$/.test(datos.celular)) {
      errores.celular = 'Formato inválido: +569XXXXXXXX';
    }

    return errores;
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [resRol, resObr] = await Promise.all([api.get('/roles'), api.get('/obras')]);
      setRoles(resRol.data);
      setTodasLasObras(resObr.data);
      await aplicarFiltros();
    } catch (err) {
      if (err.response?.status !== 401) console.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroObraId) params.append('obraId', filtroObraId);
      if (keyword) params.append('keyword', keyword);
      const response = await api.get(`/usuarios/filtrar?${params.toString()}`);
      setUsuarios(response.data);
    } catch (err) {
      if (err.response?.status !== 401) console.error('Error al filtrar');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const errores = validarFormulario(formCrear);
    if (Object.keys(errores).length > 0) {
      setFormErrors(errores);
      return;
    }

    try {
      const payload = { ...formCrear, rol: { id: parseInt(formCrear.rolId) }, obras: formCrear.obrasIds.map(id => ({ id: parseInt(id) })) };
      await api.post('/usuarios', payload);
      setShowCreateModal(false);
      setFormCrear({ rut: '', nombre: '', apellido: '', correo: '', contrasena: '', celular: '', cargo: '', recibe_notificaciones: true, rolId: '', obrasIds: [] });
      setFormErrors({});
      aplicarFiltros();
    } catch (err) {
      setBackendError(err.response?.data?.message || 'Error al guardar.');
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    const errores = validarFormulario(usuarioAEditar, true);
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
      if (usuarioAEditar.nuevaContrasena) payload.contrasena = usuarioAEditar.nuevaContrasena;
      else delete payload.contrasena;

      await api.put(`/usuarios/${usuarioAEditar.id}`, payload);
      setShowEditModal(false);
      setFormErrors({});
      aplicarFiltros();
    } catch (err) {
      setBackendError(err.response?.data?.message || 'Error al actualizar.');
    }
  };

  const toggleObraSelection = (id, isEdit = false) => {
    if (isEdit) {
      const current = usuarioAEditar.obrasIdsForm || [];
      const nuevo = current.includes(id) ? current.filter(oid => oid !== id) : [...current, id];
      setUsuarioAEditar({ ...usuarioAEditar, obrasIdsForm: nuevo });
    } else {
      const current = formCrear.obrasIds;
      const nuevo = current.includes(id) ? current.filter(oid => oid !== id) : [...current, id];
      setFormCrear({ ...formCrear, obrasIds: nuevo });
    }
  };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '4px', width: '650px', color: '#333', maxHeight: '95vh', overflowY: 'auto' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '5px' };
  const inputGroupStyle = { display: 'flex', flexDirection: 'column', minHeight: '85px' };
  const labelStyle = { fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#555' };
  const modalInputStyle = (error) => ({ padding: '10px', borderRadius: '2px', border: error ? '2px solid #d9534f' : '1px solid #ccc', fontSize: '14px', outline: 'none' });
  const errorTextStyle = { color: '#d9534f', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion" className={styles.backButton}>←</Link>
          <h1 className={styles.title}>Gestión de Usuarios</h1>
        </div>
        <button className={styles.createBtn} onClick={() => { setShowCreateModal(true); setFormErrors({}); setBackendError(''); }}>Crear Nueva</button>
      </div>

      <div className={styles.menuBox}>
        <form onSubmit={aplicarFiltros} className={styles.filtersForm}>
          <div className={styles.formGroupLarge}>
            <label className={styles.selectLabel}>Obra</label>
            <select className={styles.menuItem} value={filtroObraId} onChange={(e) => setFiltroObraId(e.target.value)}>
              <option value="">-- Seleccione Obra --</option>
              {todasLasObras.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <div className={styles.formGroupLarge}>
            <label className={styles.selectLabel}>Búsqueda Rápida</label>
            <input type="text" placeholder="RUT, Nombre..." className={styles.menuItem} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className={styles.btnGroup}>
            <button type="submit" className={styles.btnPrimary}>Filtrar</button>
            <button type="button" onClick={() => { setFiltroObraId(''); setKeyword(''); aplicarFiltros(); }} className={styles.btnSecondary}>Limpiar</button>
          </div>
        </form>
      </div>

      <div className={styles.listBox}>
        {loading ? <p style={{color: 'white', textAlign: 'center'}}>Sincronizando...</p> : 
          usuarios.map(u => (
            <div key={u.id} className={styles.itemRow}>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{u.nombre} {u.apellido}</h4>
                <p className={styles.itemSubtext}>{u.cargo || 'Sin cargo'} | {u.correo}</p>
                <p className={styles.itemSubtext}>RUT: {u.rut} | Rol: {u.rol?.nombre}</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => { 
                  setUsuarioAEditar({...u, rolIdForm: u.rol?.id, obrasIdsForm: u.obras.map(o => o.id), nuevaContrasena: ''}); 
                  setShowEditModal(true); setFormErrors({}); setBackendError('');
                }}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => { setUsuarioAEliminar(u); setShowDeleteModal(true); }}>Eliminar</button>
              </div>
            </div>
          ))
        }
      </div>

      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Registrar Nuevo Usuario</h3>
            {backendError && <p style={errorTextStyle}>{backendError}</p>}
            
            <form onSubmit={handleCrear} noValidate>
              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>RUT</label>
                  <input type="text" placeholder="12345678-K" style={modalInputStyle(formErrors.rut)} value={formCrear.rut} onChange={(e) => setFormCrear({...formCrear, rut: formatRut(e.target.value)})} />
                  {formErrors.rut && <span style={errorTextStyle}>{formErrors.rut}</span>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Cargo</label>
                  <input type="text" placeholder="Ej: Jefe de Obra" style={modalInputStyle()} value={formCrear.cargo} onChange={(e) => setFormCrear({...formCrear, cargo: e.target.value})} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Nombre</label>
                  <input type="text" placeholder="Juan" style={modalInputStyle(formErrors.nombre)} value={formCrear.nombre} onChange={(e) => setFormCrear({...formCrear, nombre: e.target.value})} />
                  {formErrors.nombre && <span style={errorTextStyle}>{formErrors.nombre}</span>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Apellido</label>
                  <input type="text" placeholder="Pérez" style={modalInputStyle(formErrors.apellido)} value={formCrear.apellido} onChange={(e) => setFormCrear({...formCrear, apellido: e.target.value})} />
                  {formErrors.apellido && <span style={errorTextStyle}>{formErrors.apellido}</span>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Correo Electrónico</label>
                  <input type="email" placeholder="ejemplo@correo.cl" style={modalInputStyle(formErrors.correo)} value={formCrear.correo} onChange={(e) => setFormCrear({...formCrear, correo: e.target.value})} />
                  {formErrors.correo && <span style={errorTextStyle}>{formErrors.correo}</span>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Celular</label>
                  <input type="text" placeholder="+56912345678" style={modalInputStyle(formErrors.celular)} value={formCrear.celular} onChange={(e) => setFormCrear({...formCrear, celular: formatCelular(e.target.value)})} />
                  {formErrors.celular && <span style={errorTextStyle}>{formErrors.celular}</span>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Contraseña Inicial</label>
                  <input type="password" placeholder="********" style={modalInputStyle(formErrors.contrasena)} value={formCrear.contrasena} onChange={(e) => setFormCrear({...formCrear, contrasena: e.target.value})} />
                  {formErrors.contrasena && <span style={errorTextStyle}>{formErrors.contrasena}</span>}
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Rol del Sistema</label>
                  <select style={modalInputStyle(formErrors.rolId)} value={formCrear.rolId} onChange={(e) => setFormCrear({...formCrear, rolId: e.target.value})}>
                    <option value="">-- Seleccione --</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                  {formErrors.rolId && <span style={errorTextStyle}>{formErrors.rolId}</span>}
                </div>
              </div>

              <div style={{margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <input type="checkbox" checked={formCrear.recibe_notificaciones} onChange={(e) => setFormCrear({...formCrear, recibe_notificaciones: e.target.checked})} />
                <label style={{fontSize: '14px'}}>Recibir Notificaciones</label>
              </div>
              
              <div>
                <label style={labelStyle}>Obras Asignadas</label>
                <div style={{maxHeight: '100px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '2px', background: '#f9f9f9'}}>
                  {todasLasObras.map(o => (
                    <div key={o.id} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0'}}>
                      <input type="checkbox" checked={formCrear.obrasIds.includes(o.id)} onChange={() => toggleObraSelection(o.id)} />
                      <span style={{fontSize: '13px'}}>{o.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                <button type="button" onClick={() => setShowCreateModal(false)} className={styles.btnSecondary} style={{border: '1px solid #ccc', color: '#333'}}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} style={{backgroundColor: '#0d3b66'}}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin;