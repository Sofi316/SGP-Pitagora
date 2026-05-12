import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../CategoriasAdmin/ListadoAdmin.module.css';

const ObrasAdmin = () => {
  const [obras, setObras] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [regiones, setRegiones] = useState([]); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formCrear, setFormCrear] = useState({
    nombre: '', direccion: '', fechaInicioPostventa: '', fechaCierrePostventa: '', empresaId: '', regionId: '', comunaId: '', actaFile: null
  });
  
  const [obraAEditar, setObraAEditar] = useState(null);
  const [obraAEliminar, setObraAEliminar] = useState(null);

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
      
      const [resObras, resEmpresas, resComunas] = await Promise.all([
        axios.get('http://localhost:8080/api/obras', config),
        axios.get('http://localhost:8080/api/empresas-clientes', config),
        axios.get('http://localhost:8080/api/comunas', config).catch(() => ({ data: [] })) 
      ]);
      
      setObras(resObras.data);
      setEmpresas(resEmpresas.data);
      
      const dataComunas = resComunas.data;
      setComunas(dataComunas);
      
      const regionesMap = new Map();
      dataComunas.forEach(c => {
        if (c.region && c.region.id) {
          regionesMap.set(c.region.id, c.region);
        }
      });
      setRegiones(Array.from(regionesMap.values()));

    } catch (err) {
      setError('Ocurrió un error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setModalError('');
    
    if (!formCrear.nombre.trim() || !formCrear.direccion.trim() || !formCrear.empresaId || !formCrear.comunaId || !formCrear.fechaInicioPostventa || !formCrear.fechaCierrePostventa) {
      setModalError('Por favor complete todos los campos obligatorios.');
      return;
    }

    const fechaInicio = new Date(formCrear.fechaInicioPostventa);
    const fechaCierre = new Date(formCrear.fechaCierrePostventa);
    
    if (fechaCierre <= fechaInicio) {
      setModalError('La fecha de cierre debe ser posterior a la fecha de inicio.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      const obraData = {
        nombre: formCrear.nombre,
        direccion: formCrear.direccion,
        fechaInicioPostventa: formCrear.fechaInicioPostventa,
        fechaCierrePostventa: formCrear.fechaCierrePostventa,
        empresaCliente: { id: parseInt(formCrear.empresaId) },
        comuna: { id: parseInt(formCrear.comunaId) },
        activo: true
      };

      formData.append('obra', new Blob([JSON.stringify(obraData)], { type: 'application/json' }));
      
      if (formCrear.actaFile) {
        formData.append('file', formCrear.actaFile);
      }

      const response = await axios.post('http://localhost:8080/api/obras', formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });
      
      const nuevaObra = response.data;
      const empresaAsociada = empresas.find(emp => emp.id === parseInt(formCrear.empresaId));
      const comunaAsociada = comunas.find(com => com.id === parseInt(formCrear.comunaId));
      
      if (empresaAsociada) nuevaObra.empresaCliente = empresaAsociada;
      if (comunaAsociada) nuevaObra.comuna = comunaAsociada;

      setObras([...obras, nuevaObra]);
      setShowCreateModal(false);
      setFormCrear({ nombre: '', direccion: '', fechaInicioPostventa: '', fechaCierrePostventa: '', empresaId: '', regionId: '', comunaId: '', actaFile: null });
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al guardar: Verifica los datos ingresados.');
    }
  };

  const abrirModalEditar = (obra) => {
    setModalError('');
    setObraAEditar({
      ...obra,
      empresaIdForm: obra.empresaCliente ? obra.empresaCliente.id : '',
      regionIdForm: obra.comuna && obra.comuna.region ? obra.comuna.region.id : '',
      comunaIdForm: obra.comuna ? obra.comuna.id : '',
      actaFile: null
    });
    setShowEditModal(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setModalError('');
    
    if (!obraAEditar.nombre.trim() || !obraAEditar.direccion.trim() || !obraAEditar.empresaIdForm || !obraAEditar.comunaIdForm || !obraAEditar.fechaInicioPostventa || !obraAEditar.fechaCierrePostventa) {
      setModalError('Por favor complete todos los campos obligatorios.');
      return;
    }

    const fechaInicio = new Date(obraAEditar.fechaInicioPostventa);
    const fechaCierre = new Date(obraAEditar.fechaCierrePostventa);
    
    if (fechaCierre <= fechaInicio) {
      setModalError('La fecha de cierre debe ser posterior a la fecha de inicio.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      const obraData = {
        nombre: obraAEditar.nombre,
        direccion: obraAEditar.direccion,
        fechaInicioPostventa: obraAEditar.fechaInicioPostventa,
        fechaCierrePostventa: obraAEditar.fechaCierrePostventa,
        empresaCliente: { id: parseInt(obraAEditar.empresaIdForm) },
        comuna: { id: parseInt(obraAEditar.comunaIdForm) }
      };

      formData.append('obra', new Blob([JSON.stringify(obraData)], { type: 'application/json' }));
      
      if (obraAEditar.actaFile) {
        formData.append('file', obraAEditar.actaFile);
      }

      const response = await axios.put(`http://localhost:8080/api/obras/${obraAEditar.id}`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });

      const obraActualizada = response.data;
      const empresaAsociada = empresas.find(emp => emp.id === parseInt(obraAEditar.empresaIdForm));
      const comunaAsociada = comunas.find(com => com.id === parseInt(obraAEditar.comunaIdForm));
      
      if (empresaAsociada) obraActualizada.empresaCliente = empresaAsociada;
      if (comunaAsociada) obraActualizada.comuna = comunaAsociada;

      setObras(obras.map(ob => ob.id === obraAEditar.id ? obraActualizada : ob));
      setShowEditModal(false);
      setObraAEditar(null);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al actualizar la obra.');
    }
  };

  const abrirModalEliminar = (obra) => {
    setModalError('');
    setObraAEliminar(obra);
    setShowDeleteModal(true);
  };

  const handleEliminar = async () => {
    setModalError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/obras/${obraAEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setObras(obras.filter(ob => ob.id !== obraAEliminar.id));
      setShowDeleteModal(false);
      setObraAEliminar(null);
    } catch (err) {
      setModalError(err.response?.data?.message || 'No se puede eliminar la obra. Es probable que tenga solicitudes asociadas pendientes.');
    }
  };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', color: '#333' };
  const inputStyle = { width: '100%', padding: '8px', margin: '8px 0 15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const buttonGroupStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' };
  const btnStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
  const cancelBtnStyle = { ...btnStyle, backgroundColor: '#ccc', color: '#333' };
  const confirmBtnStyle = { ...btnStyle, backgroundColor: '#0d3b66', color: '#fff' };
  const deleteBtnStyle = { ...btnStyle, backgroundColor: '#d9534f', color: '#fff' };

  const comunasFiltradasCrear = comunas.filter(c => c.region && c.region.id === parseInt(formCrear.regionId));
  const comunasFiltradasEditar = obraAEditar ? comunas.filter(c => c.region && c.region.id === parseInt(obraAEditar.regionIdForm)) : [];

  return (
    <div className={styles.container}>
      
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion" className={styles.backButton} title="Volver a Gestión">&#8592;</Link>
          <h1 className={styles.title}>Obras</h1>
        </div>
        <button className={styles.createBtn} onClick={() => { setModalError(''); setShowCreateModal(true); }}>
          Crear Nueva
        </button>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando obras...</p>
        ) : obras.length === 0 && !error ? (
          <p style={{ color: 'white' }}>No hay obras registradas.</p>
        ) : (
          obras.map((ob) => (
            <div key={ob.id} className={styles.itemRow}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.itemName}>
                  {ob.nombre} 
                  {ob.rutaActaEntrega && (
                    <a href={ob.rutaActaEntrega} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', fontSize: '12px', color: '#1c07db', textDecoration: 'none' }}>
                       Ver Acta
                    </a>
                  )}
                </span>
                <span style={{ fontSize: '12px', color: '#e0e0e0' }}>
                  Empresa: {ob.empresaCliente ? ob.empresaCliente.razonSocial : 'Sin empresa'} | Comuna: {ob.comuna ? ob.comuna.nombre : 'Sin comuna'}
                </span>
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => abrirModalEditar(ob)}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => abrirModalEliminar(ob)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Crear Nueva Obra</h3>
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '5px 0' }}>{modalError}</p>}
            <form onSubmit={handleCrear}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre Obra:</label>
              <input type="text" value={formCrear.nombre} onChange={(e) => setFormCrear({...formCrear, nombre: e.target.value})} style={inputStyle} />
              
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Dirección:</label>
              <input type="text" value={formCrear.direccion} onChange={(e) => setFormCrear({...formCrear, direccion: e.target.value})} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Inicio Postventa:</label>
                  <input type="date" value={formCrear.fechaInicioPostventa} onChange={(e) => setFormCrear({...formCrear, fechaInicioPostventa: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Cierre Postventa:</label>
                  <input type="date" value={formCrear.fechaCierrePostventa} onChange={(e) => setFormCrear({...formCrear, fechaCierrePostventa: e.target.value})} style={inputStyle} />
                </div>
              </div>
              
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Empresa Cliente:</label>
              <select value={formCrear.empresaId} onChange={(e) => setFormCrear({...formCrear, empresaId: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione una empresa --</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Región:</label>
                  <select 
                    value={formCrear.regionId} 
                    onChange={(e) => setFormCrear({...formCrear, regionId: e.target.value, comunaId: ''})} 
                    style={inputStyle}
                  >
                    <option value="">-- Región --</option>
                    {regiones.map(reg => (
                      <option key={reg.id} value={reg.id}>{reg.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Comuna:</label>
                  <select 
                    value={formCrear.comunaId} 
                    onChange={(e) => setFormCrear({...formCrear, comunaId: e.target.value})} 
                    style={inputStyle}
                    disabled={!formCrear.regionId}
                  >
                    <option value="">-- Comuna --</option>
                    {comunasFiltradasCrear.map(com => (
                      <option key={com.id} value={com.id}>{com.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Acta de Entrega (PDF - Opcional):</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFormCrear({...formCrear, actaFile: e.target.files[0]})} style={inputStyle} />

              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowCreateModal(false); setFormCrear({nombre: '', direccion: '', fechaInicioPostventa: '', fechaCierrePostventa: '', empresaId: '', regionId: '', comunaId: '', actaFile: null}); setModalError('');}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && obraAEditar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Editar Obra</h3>
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '5px 0' }}>{modalError}</p>}
            <form onSubmit={handleEditar}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre Obra:</label>
              <input type="text" value={obraAEditar.nombre} onChange={(e) => setObraAEditar({...obraAEditar, nombre: e.target.value})} style={inputStyle} />
              
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Dirección:</label>
              <input type="text" value={obraAEditar.direccion} onChange={(e) => setObraAEditar({...obraAEditar, direccion: e.target.value})} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Inicio Postventa:</label>
                  <input type="date" value={obraAEditar.fechaInicioPostventa} onChange={(e) => setObraAEditar({...obraAEditar, fechaInicioPostventa: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Cierre Postventa:</label>
                  <input type="date" value={obraAEditar.fechaCierrePostventa} onChange={(e) => setObraAEditar({...obraAEditar, fechaCierrePostventa: e.target.value})} style={inputStyle} />
                </div>
              </div>
              
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Empresa Cliente:</label>
              <select value={obraAEditar.empresaIdForm} onChange={(e) => setObraAEditar({...obraAEditar, empresaIdForm: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione una empresa --</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razonSocial}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Región:</label>
                  <select 
                    value={obraAEditar.regionIdForm} 
                    onChange={(e) => setObraAEditar({...obraAEditar, regionIdForm: e.target.value, comunaIdForm: ''})} 
                    style={inputStyle}
                  >
                    <option value="">-- Región --</option>
                    {regiones.map(reg => (
                      <option key={reg.id} value={reg.id}>{reg.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Comuna:</label>
                  <select 
                    value={obraAEditar.comunaIdForm} 
                    onChange={(e) => setObraAEditar({...obraAEditar, comunaIdForm: e.target.value})} 
                    style={inputStyle}
                    disabled={!obraAEditar.regionIdForm}
                  >
                    <option value="">-- Comuna --</option>
                    {comunasFiltradasEditar.map(com => (
                      <option key={com.id} value={com.id}>{com.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Actualizar Acta (PDF - Opcional):</label>
              {obraAEditar.rutaActaEntrega && (
                <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                  <span>Acta actual: </span>
                  <a href={obraAEditar.rutaActaEntrega} target="_blank" rel="noreferrer" style={{ color: '#00d1b2' }}>Ver documento</a>
                </div>
              )}
              <input type="file" accept="application/pdf" onChange={(e) => setObraAEditar({...obraAEditar, actaFile: e.target.files[0]})} style={inputStyle} />

              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowEditModal(false); setObraAEditar(null); setModalError('');}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && obraAEliminar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Confirmar Eliminación</h3>
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '5px 0' }}>{modalError}</p>}
            <p>¿Estás seguro de que deseas eliminar la obra <strong>"{obraAEliminar.nombre}"</strong>?</p>
            <p style={{fontSize: '12px', color: '#666'}}>Esta acción no se puede deshacer.</p>
            <div style={buttonGroupStyle}>
              <button style={cancelBtnStyle} onClick={() => {setShowDeleteModal(false); setObraAEliminar(null); setModalError('');}}>Cancelar</button>
              <button style={deleteBtnStyle} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ObrasAdmin;