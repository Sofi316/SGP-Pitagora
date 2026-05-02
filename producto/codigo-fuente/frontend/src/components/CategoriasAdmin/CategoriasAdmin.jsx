import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import styles from './ListadoAdmin.module.css';

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); 

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [categoriaAEditar, setCategoriaAEditar] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categorias', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategorias(response.data);
    } catch (err) {
      setError('Ocurrió un error al cargar las categorías.');
    } finally {
      setLoading(false); 
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/categorias', 
        { 
          nombre: nuevaCategoria,
          activo: true 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCategorias([...categorias, response.data]);
      setShowCreateModal(false);
      setNuevaCategoria('');
    } catch (err) {
      alert('Error al crear la categoría');
    }
  };

  const abrirModalEditar = (cat) => {
    setCategoriaAEditar({ ...cat }); 
    setShowEditModal(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!categoriaAEditar.nombre.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/categorias/${categoriaAEditar.id}`, 
        { nombre: categoriaAEditar.nombre },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategorias(categorias.map(cat => cat.id === categoriaAEditar.id ? response.data : cat));
      setShowEditModal(false);
      setCategoriaAEditar(null);
    } catch (err) {
      alert('Error al actualizar la categoría');
    }
  };

  const abrirModalEliminar = (cat) => {
    setCategoriaAEliminar(cat);
    setShowDeleteModal(true);
  };

  const handleEliminar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/categorias/${categoriaAEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCategorias(categorias.filter(cat => cat.id !== categoriaAEliminar.id));
      setShowDeleteModal(false);
      setCategoriaAEliminar(null);
    } catch (err) {
      alert('Error al eliminar la categoría. Es posible que esté en uso.');
    }
  };

  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };
  const modalContentStyle = {
    backgroundColor: '#fff', padding: '30px', borderRadius: '8px',
    width: '400px', maxWidth: '90%', color: '#333'
  };
  const inputStyle = {
    width: '100%', padding: '10px', margin: '10px 0 20px',
    border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
  };
  const buttonGroupStyle = { display: 'flex', justifyContent: 'flex-end', gap: '10px' };
  const btnStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
  const cancelBtnStyle = { ...btnStyle, backgroundColor: '#ccc', color: '#333' };
  const confirmBtnStyle = { ...btnStyle, backgroundColor: '#0d3b66', color: '#fff' };
  const deleteBtnStyle = { ...btnStyle, backgroundColor: '#d9534f', color: '#fff' };


  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion" className={styles.backButton} title="Volver a Gestión">
            &#8592;
          </Link>
          <h1 className={styles.title}>Categorías</h1>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          Crear Nueva
        </button>
      </div>
      
      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando categorías...</p>
        ) : categorias.length === 0 ? (
          <p style={{ color: 'white' }}>No hay categorías registradas.</p>
        ) : (
          categorias.map((cat) => (
            <div key={cat.id} className={styles.itemRow}>
              <span className={styles.itemName}>{cat.nombre}</span>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => abrirModalEditar(cat)}>
                  Editar
                </button>
                <button className={styles.deleteBtn} onClick={() => abrirModalEliminar(cat)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Crear Nueva Categoría</h3>
            <form onSubmit={handleCrear}>
              <input 
                type="text" 
                placeholder="Nombre de la categoría" 
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                style={inputStyle}
                autoFocus
              />
              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowCreateModal(false); setNuevaCategoria('');}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && categoriaAEditar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Editar Categoría</h3>
            <form onSubmit={handleEditar}>
              <input 
                type="text" 
                value={categoriaAEditar.nombre}
                onChange={(e) => setCategoriaAEditar({...categoriaAEditar, nombre: e.target.value})}
                style={inputStyle}
                autoFocus
              />
              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowEditModal(false); setCategoriaAEditar(null);}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && categoriaAEliminar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar la categoría <strong>"{categoriaAEliminar.nombre}"</strong>?</p>
            <p style={{fontSize: '12px', color: '#666'}}>Esta acción no se puede deshacer.</p>
            <div style={{...buttonGroupStyle, marginTop: '20px'}}>
              <button style={cancelBtnStyle} onClick={() => {setShowDeleteModal(false); setCategoriaAEliminar(null);}}>Cancelar</button>
              <button style={deleteBtnStyle} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriasAdmin;