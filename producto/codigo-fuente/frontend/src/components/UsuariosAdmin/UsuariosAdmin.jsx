import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../CategoriasAdmin/ListadoAdmin.module.css';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formCrear, setFormCrear] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    celular: '',
    cargo: '',
    recibe_notificaciones: true,
    rolId: '',
    empresaId: ''
  });

  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const [modalError, setModalError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [resUsuarios, resEmpresas, resRoles] = await Promise.all([
        axios.get('http://localhost:8080/api/usuarios', config),
        axios.get('http://localhost:8080/api/empresas-clientes', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:8080/api/roles', config).catch(() => ({ data: [] }))
      ]);

      setUsuarios(resUsuarios.data);
      setEmpresas(resEmpresas.data);
      setRoles(resRoles.data);
    } catch (err) {
      setError('Ocurrió un error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formCrear.rut.trim() || !formCrear.nombre.trim() || !formCrear.apellido.trim() || !formCrear.correo.trim() || !formCrear.contrasena || !formCrear.rolId) {
      setModalError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/usuarios', 
        {
          rut: formCrear.rut,
          nombre: formCrear.nombre,
          apellido: formCrear.apellido,
          correo: formCrear.correo,
          contrasena: formCrear.contrasena,
          celular: formCrear.celular,
          cargo: formCrear.cargo,
          recibe_notificaciones: formCrear.recibe_notificaciones,
          activo: true,
          rol: { id: parseInt(formCrear.rolId) },
          empresa: formCrear.empresaId ? { id: parseInt(formCrear.empresaId) } : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const nuevoUsuario = response.data;
      const empresaAsociada = empresas.find(emp => emp.id === parseInt(formCrear.empresaId));
      const rolAsociado = roles.find(r => r.id === parseInt(formCrear.rolId));

      if (empresaAsociada) nuevoUsuario.empresa = empresaAsociada;
      if (rolAsociado) nuevoUsuario.rol = rolAsociado;

      setUsuarios([...usuarios, nuevoUsuario]);
      setShowCreateModal(false);
      setFormCrear({ rut: '', nombre: '', apellido: '', correo: '', contrasena: '', celular: '', cargo: '', recibe_notificaciones: true, rolId: '', empresaId: '' });
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al guardar el usuario.');
    }
  };

  const abrirModalEditar = (usuario) => {
    setModalError('');
    setUsuarioAEditar({
      ...usuario,
      contrasena: '',
      rolIdForm: usuario.rol ? usuario.rol.id : '',
      empresaIdForm: usuario.empresa ? usuario.empresa.id : ''
    });
    setShowEditModal(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!usuarioAEditar.rut.trim() || !usuarioAEditar.nombre.trim() || !usuarioAEditar.apellido.trim() || !usuarioAEditar.correo.trim() || !usuarioAEditar.rolIdForm) {
      setModalError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        rut: usuarioAEditar.rut,
        nombre: usuarioAEditar.nombre,
        apellido: usuarioAEditar.apellido,
        correo: usuarioAEditar.correo,
        celular: usuarioAEditar.celular,
        cargo: usuarioAEditar.cargo,
        recibe_notificaciones: usuarioAEditar.recibe_notificaciones,
        activo: usuarioAEditar.activo,
        rol: { id: parseInt(usuarioAEditar.rolIdForm) },
        empresa: usuarioAEditar.empresaIdForm ? { id: parseInt(usuarioAEditar.empresaIdForm) } : null
      };

      if (usuarioAEditar.contrasena) {
        payload.contrasena = usuarioAEditar.contrasena;
      }

      const response = await axios.put(`http://localhost:8080/api/usuarios/${usuarioAEditar.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const usuarioActualizado = response.data;
      const empresaAsociada = empresas.find(emp => emp.id === parseInt(usuarioAEditar.empresaIdForm));
      const rolAsociado = roles.find(r => r.id === parseInt(usuarioAEditar.rolIdForm));

      if (empresaAsociada) usuarioActualizado.empresa = empresaAsociada;
      if (rolAsociado) usuarioActualizado.rol = rolAsociado;

      setUsuarios(usuarios.map(u => u.id === usuarioAEditar.id ? usuarioActualizado : u));
      setShowEditModal(false);
      setUsuarioAEditar(null);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al actualizar el usuario.');
    }
  };

  const abrirModalEliminar = (usuario) => {
    setModalError('');
    setUsuarioAEliminar(usuario);
    setShowDeleteModal(true);
  };

  const handleEliminar = async () => {
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/usuarios/${usuarioAEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsuarios(usuarios.filter(u => u.id !== usuarioAEliminar.id));
      setShowDeleteModal(false);
      setUsuarioAEliminar(null);
    } catch (err) {
      setModalError(err.response?.data?.message || 'No se puede eliminar el usuario.');
    }
  };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', color: '#333' };
  const inputStyle = { width: '100%', padding: '8px', margin: '8px 0 15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const checkboxStyle = { margin: '8px 0 15px' };
  const buttonGroupStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' };
  const btnStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
  const cancelBtnStyle = { ...btnStyle, backgroundColor: '#ccc', color: '#333' };
  const confirmBtnStyle = { ...btnStyle, backgroundColor: '#0d3b66', color: '#fff' };
  const deleteBtnStyle = { ...btnStyle, backgroundColor: '#d9534f', color: '#fff' };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion" className={styles.backButton} title="Volver a Gestión">&#8592;</Link>
          <h1 className={styles.title}>Usuarios</h1>
        </div>
        <button className={styles.createBtn} onClick={() => { setModalError(''); setShowCreateModal(true); }}>
          Crear Nuevo
        </button>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando usuarios...</p>
        ) : usuarios.length === 0 && !error ? (
          <p style={{ color: 'white' }}>No hay usuarios registrados.</p>
        ) : (
          usuarios.map((u) => (
            <div key={u.id} className={styles.itemRow}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.itemName}>{u.nombre} {u.apellido}</span>
                <span style={{ fontSize: '12px', color: '#e0e0e0' }}>
                  RUT: {u.rut} | Correo: {u.correo} | Rol: {u.rol ? u.rol.nombre : 'Sin Rol'} | Empresa: {u.empresa ? u.empresa.razonSocial : 'Sin Empresa'}
                </span>
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => abrirModalEditar(u)}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => abrirModalEliminar(u)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Crear Nuevo Usuario</h3>
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '5px 0' }}>{modalError}</p>}
            <form onSubmit={handleCrear}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>RUT:</label>
              <input type="text" value={formCrear.rut} onChange={(e) => setFormCrear({...formCrear, rut: e.target.value})} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre:</label>
                  <input type="text" value={formCrear.nombre} onChange={(e) => setFormCrear({...formCrear, nombre: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Apellido:</label>
                  <input type="text" value={formCrear.apellido} onChange={(e) => setFormCrear({...formCrear, apellido: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Correo Electrónico:</label>
              <input type="email" value={formCrear.correo} onChange={(e) => setFormCrear({...formCrear, correo: e.target.value})} style={inputStyle} />

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Contraseña:</label>
              <input type="password" value={formCrear.contrasena} onChange={(e) => setFormCrear({...formCrear, contrasena: e.target.value})} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Celular:</label>
                  <input type="text" value={formCrear.celular} onChange={(e) => setFormCrear({...formCrear, celular: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Cargo:</label>
                  <input type="text" value={formCrear.cargo} onChange={(e) => setFormCrear({...formCrear, cargo: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Rol:</label>
              <select value={formCrear.rolId} onChange={(e) => setFormCrear({...formCrear, rolId: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione un Rol --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Empresa Cliente:</label>
              <select value={formCrear.empresaId} onChange={(e) => setFormCrear({...formCrear, empresaId: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione una empresa (Opcional) --</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
                ))}
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formCrear.recibe_notificaciones} onChange={(e) => setFormCrear({...formCrear, recibe_notificaciones: e.target.checked})} style={checkboxStyle} id="createRecibeNotif" />
                <label htmlFor="createRecibeNotif" style={{ fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Recibe Notificaciones</label>
              </div>

              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowCreateModal(false); setFormCrear({rut: '', nombre: '', apellido: '', correo: '', contrasena: '', celular: '', cargo: '', recibe_notificaciones: true, rolId: '', empresaId: ''}); setModalError('');}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && usuarioAEditar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Editar Usuario</h3>
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '5px 0' }}>{modalError}</p>}
            <form onSubmit={handleEditar}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>RUT:</label>
              <input type="text" value={usuarioAEditar.rut} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, rut: e.target.value})} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre:</label>
                  <input type="text" value={usuarioAEditar.nombre} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, nombre: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Apellido:</label>
                  <input type="text" value={usuarioAEditar.apellido} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, apellido: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Correo Electrónico:</label>
              <input type="email" value={usuarioAEditar.correo} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, correo: e.target.value})} style={inputStyle} />

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nueva Contraseña (dejar vacío para mantener actual):</label>
              <input type="password" value={usuarioAEditar.contrasena} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, contrasena: e.target.value})} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Celular:</label>
                  <input type="text" value={usuarioAEditar.celular} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, celular: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Cargo:</label>
                  <input type="text" value={usuarioAEditar.cargo} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, cargo: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Rol:</label>
              <select value={usuarioAEditar.rolIdForm} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, rolIdForm: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione un Rol --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Empresa Cliente:</label>
              <select value={usuarioAEditar.empresaIdForm} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, empresaIdForm: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione una empresa (Opcional) --</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={usuarioAEditar.recibe_notificaciones} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, recibe_notificaciones: e.target.checked})} style={checkboxStyle} id="editRecibeNotif" />
                  <label htmlFor="editRecibeNotif" style={{ fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Recibe Notificaciones</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={usuarioAEditar.activo} onChange={(e) => setUsuarioAEditar({...usuarioAEditar, activo: e.target.checked})} style={checkboxStyle} id="editActivo" />
                  <label htmlFor="editActivo" style={{ fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Activo</label>
                </div>
              </div>

              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowEditModal(false); setUsuarioAEditar(null); setModalError('');}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && usuarioAEliminar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Confirmar Eliminación</h3>
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '5px 0' }}>{modalError}</p>}
            <p>¿Estás seguro de que deseas eliminar al usuario <strong>"{usuarioAEliminar.nombre} {usuarioAEliminar.apellido}"</strong>?</p>
            <div style={buttonGroupStyle}>
              <button style={cancelBtnStyle} onClick={() => {setShowDeleteModal(false); setUsuarioAEliminar(null); setModalError('');}}>Cancelar</button>
              <button style={deleteBtnStyle} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin;