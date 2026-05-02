import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../CategoriasAdmin/ListadoAdmin.module.css';

const EmpresasAdmin = () => {
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formCrear, setFormCrear] = useState({ rut: '', razonSocial: '' });
  const [empresaAEditar, setEmpresaAEditar] = useState(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/empresas-clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpresas(response.data);
    } catch (err) {
      setError('Ocurrió un error al cargar las empresas clientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!formCrear.rut.trim() || !formCrear.razonSocial.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/empresas-clientes', 
        { 
          rut: formCrear.rut,
          razonSocial: formCrear.razonSocial,
          activo: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEmpresas([...empresas, response.data]);
      setShowCreateModal(false);
      setFormCrear({ rut: '', razonSocial: '' });
    } catch (err) {
      alert('Error al crear la empresa cliente');
    }
  };

  const abrirModalEditar = (empresa) => {
    setEmpresaAEditar({ ...empresa });
    setShowEditModal(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!empresaAEditar.rut.trim() || !empresaAEditar.razonSocial.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/empresas-clientes/${empresaAEditar.id}`, 
        { 
          rut: empresaAEditar.rut,
          razonSocial: empresaAEditar.razonSocial
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmpresas(empresas.map(emp => emp.id === empresaAEditar.id ? response.data : emp));
      setShowEditModal(false);
      setEmpresaAEditar(null);
    } catch (err) {
      alert('Error al actualizar la empresa cliente');
    }
  };

  const abrirModalEliminar = (empresa) => {
    setEmpresaAEliminar(empresa);
    setShowDeleteModal(true);
  };

  const handleEliminar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/empresas-clientes/${empresaAEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmpresas(empresas.filter(emp => emp.id !== empresaAEliminar.id));
      setShowDeleteModal(false);
      setEmpresaAEliminar(null);
    } catch (err) {
      alert('Error al eliminar la empresa cliente.');
    }
  };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '400px', maxWidth: '90%', color: '#333' };
  const inputStyle = { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const buttonGroupStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' };
  const btnStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
  const cancelBtnStyle = { ...btnStyle, backgroundColor: '#ccc', color: '#333' };
  const confirmBtnStyle = { ...btnStyle, backgroundColor: '#0d3b66', color: '#fff' };
  const deleteBtnStyle = { ...btnStyle, backgroundColor: '#d9534f', color: '#fff' };

  return (
    <div className={styles.container}>
      
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion" className={styles.backButton} title="Volver a Gestión">&#8592;</Link>
          <h1 className={styles.title}>Empresas Clientes</h1>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          Crear Nueva
        </button>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando empresas...</p>
        ) : empresas.length === 0 && !error ? (
          <p style={{ color: 'white' }}>No hay empresas registradas.</p>
        ) : (
          empresas.map((emp) => (
            <div key={emp.id} className={styles.itemRow}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.itemName}>{emp.razonSocial}</span>
                <span style={{ fontSize: '12px', color: '#e0e0e0' }}>RUT: {emp.rut}</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => abrirModalEditar(emp)}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => abrirModalEliminar(emp)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Crear Nueva Empresa</h3>
            <form onSubmit={handleCrear}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>RUT:</label>
              <input type="text" value={formCrear.rut} onChange={(e) => setFormCrear({...formCrear, rut: e.target.value})} style={inputStyle} autoFocus />
              
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Razón Social:</label>
              <input type="text" value={formCrear.razonSocial} onChange={(e) => setFormCrear({...formCrear, razonSocial: e.target.value})} style={inputStyle} />
              
              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowCreateModal(false); setFormCrear({rut:'', razonSocial:''});}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && empresaAEditar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Editar Empresa</h3>
            <form onSubmit={handleEditar}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>RUT:</label>
              <input type="text" value={empresaAEditar.rut} onChange={(e) => setEmpresaAEditar({...empresaAEditar, rut: e.target.value})} style={inputStyle} />
              
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Razón Social:</label>
              <input type="text" value={empresaAEditar.razonSocial} onChange={(e) => setEmpresaAEditar({...empresaAEditar, razonSocial: e.target.value})} style={inputStyle} autoFocus />
              
              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowEditModal(false); setEmpresaAEditar(null);}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && empresaAEliminar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar la empresa <strong>"{empresaAEliminar.razonSocial}"</strong>?</p>
            <p style={{fontSize: '12px', color: '#666'}}>Esta acción no se puede deshacer.</p>
            <div style={buttonGroupStyle}>
              <button style={cancelBtnStyle} onClick={() => {setShowDeleteModal(false); setEmpresaAEliminar(null);}}>Cancelar</button>
              <button style={deleteBtnStyle} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmpresasAdmin;