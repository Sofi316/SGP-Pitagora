import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './UsuariosAdmin.module.css';

const UsuariosAdmin = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [todasLasObras, setTodasLasObras] = useState([]);
  const [todasLasEmpresas, setTodasLasEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroEmpresaId, setFiltroEmpresaId] = useState('');
  const [filtroObraId, setFiltroObraId] = useState('');
  const [keyword, setKeyword] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [backendError, setBackendError] = useState('');

  const estadoInicialForm = {
    rut: '', nombre: '', apellido: '', correo: '', contrasena: '', 
    celular: '', cargo: '', recibe_notificaciones: true, rolId: '', obrasIds: []
  };
  const [formCrear, setFormCrear] = useState(estadoInicialForm);
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
    else if (!validarRutChileno(datos.rut)) errores.rut = 'Formato de RUT inválido.';
    
    if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
    if (!datos.apellido) errores.apellido = 'El apellido es obligatorio.';
    
    if (!datos.correo) errores.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) errores.correo = 'Correo inválido.';
    
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
      const [resRol, resObr, resEmp] = await Promise.all([
        api.get('/roles').catch(() => ({ data: [] })),
        api.get('/obras').catch(() => ({ data: [] })),
        api.get('/empresas-clientes').catch(() => ({ data: [] }))
      ]);
      setRoles(resRol.data);
      setTodasLasObras(resObr.data);
      setTodasLasEmpresas(resEmp.data);
      await aplicarFiltros();
    } catch (err) {
      if (err.response?.status !== 401) console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEmpresaId) params.append('empresaId', filtroEmpresaId);
      if (filtroObraId) params.append('obraId', filtroObraId);
      if (keyword) params.append('keyword', keyword);
      const response = await api.get(`/usuarios/filtrar?${params.toString()}`);
      setUsuarios(response.data);
    } catch (err) {
      if (err.response?.status !== 401) console.error(err);
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
      setFormCrear(estadoInicialForm);
      setFormErrors({});
      setBackendError('');
      aplicarFiltros();
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const msg = (typeof data === 'string' ? data : data?.message || '')?.toLowerCase() || '';
      
      // Si el RUT existe pero está inactivo (409), reactivar automáticamente
      if (status === 409 && msg.includes('inactivo')) {
        try {
          const payload = { ...formCrear, activo: true, rol: { id: parseInt(formCrear.rolId) }, obras: formCrear.obrasIds.map(id => ({ id: parseInt(id) })) };
          await api.put(`/usuarios/reactivar/${formCrear.rut}`, payload);
          setShowCreateModal(false);
          setFormCrear(estadoInicialForm);
          setFormErrors({});
          setBackendError('');
          aplicarFiltros();
        } catch (reactivateErr) {
          setBackendError(reactivateErr.response?.data?.message || 'Error al reactivar cuenta.');
        }
      } else {
        // Mostrar error para otros casos (RUT duplicado activo, correo duplicado, etc)
        setBackendError(err.response?.data?.message || 'Error al guardar. Verifique RUT o Correo duplicado.');
      }
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
      setBackendError(err.response?.data?.message || 'Conflicto de Correo: El email ya pertenece a otra cuenta.');
    }
  };

  const handleEliminar = async () => {
    const currentUserEmail = localStorage.getItem('userEmail') || ''; 
    if (usuarioAEliminar && usuarioAEliminar.correo === currentUserEmail) {
      setBackendError('Excepción de Auto-eliminación: No puedes desactivar tu propia cuenta.');
      return;
    }

    try {
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      setShowDeleteModal(false);
      setUsuarioAEliminar(null);
      aplicarFiltros();
    } catch (err) {
      setBackendError(err.response?.data?.message || 'Error al desactivar usuario.');
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

  const handleEmpresaFilterChange = (e) => {
    setFiltroEmpresaId(e.target.value);
    setFiltroObraId(''); 
  };

  const obrasFiltradasMenu = filtroEmpresaId
    ? todasLasObras.filter(o => o.empresaCliente?.id === parseInt(filtroEmpresaId))
    : todasLasObras;

  const sOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const sContent = { backgroundColor: '#fff', padding: '25px', borderRadius: '4px', width: '650px', color: '#333', maxHeight: '95vh', overflowY: 'auto' };
  const sGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '5px' };
  const sGroup = { display: 'flex', flexDirection: 'column', minHeight: '85px' };
  const sLabel = { fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#555' };
  const sInput = (err) => ({ padding: '10px', borderRadius: '2px', border: err ? '2px solid #d9534f' : '1px solid #ccc', fontSize: '14px', outline: 'none' });
  const sError = { color: '#d9534f', fontSize: '11px', marginTop: '2px', fontWeight: 'bold' };
  const sBtnSubmit = { backgroundColor: '#0d3b66', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion" className={styles.backButton}>←</Link>
          <h1 className={styles.title}>Gestión de Usuarios</h1>
        </div>
        <button className={styles.createBtn} onClick={() => { setShowCreateModal(true); setFormErrors({}); setBackendError(''); setFormCrear(estadoInicialForm); }}>Crear Nuevo</button>
      </div>

      <div className={styles.menuBox}>
        <form onSubmit={aplicarFiltros} className={styles.filtersForm}>
          <div className={styles.formGroupLarge}>
            <label className={styles.selectLabel}>Empresa</label>
            <select className={styles.menuItem} value={filtroEmpresaId} onChange={handleEmpresaFilterChange}>
              <option value="">-- Seleccione Empresa --</option>
              {todasLasEmpresas.map(e => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}
            </select>
          </div>
          <div className={styles.formGroupLarge}>
            <label className={styles.selectLabel}>Obra</label>
            <select className={styles.menuItem} value={filtroObraId} onChange={(e) => setFiltroObraId(e.target.value)}>
              <option value="">-- Seleccione Obra --</option>
              {obrasFiltradasMenu.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <div className={styles.formGroupLarge}>
            <label className={styles.selectLabel}>Búsqueda Rápida</label>
            <input type="text" placeholder="RUT, Nombre..." className={styles.menuItem} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <div className={styles.btnGroup}>
            <button type="submit" className={styles.btnPrimary}>Filtrar</button>
            <button type="button" onClick={async () => { 
              setFiltroEmpresaId(''); 
              setFiltroObraId(''); 
              setKeyword(''); 
              setLoading(true);
              try {
                const response = await api.get('/usuarios/filtrar');
                setUsuarios(response.data);
              } catch (err) {
                if (err.response?.status !== 401) console.error(err);
              } finally {
                setLoading(false);
              }
            }} className={styles.btnSecondary}>Limpiar</button>
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
                <button className={styles.detailBtn} onClick={() => navigate(`/admin/gestion/usuarios/${u.id}`)}>Detalle</button>
                <button className={styles.editBtn} onClick={() => {
                  setUsuarioAEditar({...u, rolIdForm: u.rol?.id, obrasIdsForm: u.obras.map(o => o.id), nuevaContrasena: ''});
                  setShowEditModal(true); setFormErrors({}); setBackendError('');
                }}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => { setUsuarioAEliminar(u); setShowDeleteModal(true); setBackendError(''); }}>Eliminar</button>
              </div>
            </div>
          ))
        }
      </div>

      {showCreateModal && (
        <div style={sOverlay}>
          <div style={sContent}>
            <h3 style={{margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Registrar Nuevo Usuario</h3>
            {backendError && <p style={sError}>{backendError}</p>}
            
            <form onSubmit={handleCrear} noValidate>
              <div style={sGrid}>
                <div style={sGroup}>
                  <label style={sLabel}>RUT</label>
                  <input type="text" placeholder="12345678-K" style={sInput(formErrors.rut)} value={formCrear.rut} onChange={(e) => setFormCrear({...formCrear, rut: formatRut(e.target.value)})} />
                  {formErrors.rut && <span style={sError}>{formErrors.rut}</span>}
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Cargo</label>
                  <input type="text" placeholder="Ej: Jefe de Obra" style={sInput()} value={formCrear.cargo} onChange={(e) => setFormCrear({...formCrear, cargo: e.target.value})} />
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Nombre</label>
                  <input type="text" placeholder="Juan" style={sInput(formErrors.nombre)} value={formCrear.nombre} onChange={(e) => setFormCrear({...formCrear, nombre: e.target.value})} />
                  {formErrors.nombre && <span style={sError}>{formErrors.nombre}</span>}
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Apellido</label>
                  <input type="text" placeholder="Pérez" style={sInput(formErrors.apellido)} value={formCrear.apellido} onChange={(e) => setFormCrear({...formCrear, apellido: e.target.value})} />
                  {formErrors.apellido && <span style={sError}>{formErrors.apellido}</span>}
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Correo Electrónico</label>
                  <input type="email" placeholder="ejemplo@correo.cl" style={sInput(formErrors.correo)} value={formCrear.correo} onChange={(e) => setFormCrear({...formCrear, correo: e.target.value})} />
                  {formErrors.correo && <span style={sError}>{formErrors.correo}</span>}
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Celular</label>
                  <input type="text" placeholder="+56912345678" style={sInput(formErrors.celular)} value={formCrear.celular} onChange={(e) => setFormCrear({...formCrear, celular: formatCelular(e.target.value)})} />
                  {formErrors.celular && <span style={sError}>{formErrors.celular}</span>}
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Contraseña Inicial</label>
                  <input type="password" placeholder="********" style={sInput(formErrors.contrasena)} value={formCrear.contrasena} onChange={(e) => setFormCrear({...formCrear, contrasena: e.target.value})} />
                  {formErrors.contrasena && <span style={sError}>{formErrors.contrasena}</span>}
                </div>
                <div style={sGroup}>
                  <label style={sLabel}>Rol del Sistema</label>
                  <select style={sInput(formErrors.rolId)} value={formCrear.rolId} onChange={(e) => setFormCrear({...formCrear, rolId: e.target.value})}>
                    <option value="">-- Seleccione --</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                  {formErrors.rolId && <span style={sError}>{formErrors.rolId}</span>}
                </div>
              </div>

              <div style={{margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <input type="checkbox" checked={formCrear.recibe_notificaciones} onChange={(e) => setFormCrear({...formCrear, recibe_notificaciones: e.target.checked})} />
                <label style={{fontSize: '14px'}}>Recibir Notificaciones</label>
              </div>
              
              <div>
                <label style={sLabel}>Obras Asignadas</label>
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
                <button type="button" onClick={() => setShowCreateModal(false)} className={styles.btnSecondaryModal}>Cancelar</button>
                <button type="submit" style={sBtnSubmit}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && usuarioAEditar && (
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
                      <input type="checkbox" checked={(usuarioAEditar.obrasIdsForm || []).includes(o.id)} onChange={() => toggleObraSelection(o.id, true)} />
                      <span style={{fontSize: '13px'}}>{o.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                <button type="button" onClick={() => setShowEditModal(false)} className={styles.btnSecondaryModal}>Cancelar</button>
                <button type="submit" style={sBtnSubmit}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && usuarioAEliminar && (
        <div style={sOverlay}>
          <div style={{...sContent, width: '400px', textAlign: 'center'}}>
            <h3 style={{margin: '0 0 15px 0', color: '#d9534f'}}>Confirmar Eliminación</h3>
            <p>¿Estás seguro que deseas desactivar al usuario <strong>{usuarioAEliminar.nombre} {usuarioAEliminar.apellido}</strong>?</p>
            <p style={{fontSize: '12px', color: '#777', marginBottom: '15px'}}>Se mantendrá en el histórico, pero no podrá acceder ni recibir correos.</p>
            {backendError && <p style={sError}>{backendError}</p>}
            
            <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
              <button onClick={() => { setShowDeleteModal(false); setBackendError(''); }} className={styles.btnSecondaryModal}>Cancelar</button>
              <button onClick={handleEliminar} className={styles.deleteBtn}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin;