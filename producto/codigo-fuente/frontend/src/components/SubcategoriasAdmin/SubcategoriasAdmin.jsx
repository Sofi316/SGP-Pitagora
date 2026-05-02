import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../CategoriasAdmin/ListadoAdmin.module.css';

const SubcategoriasAdmin = () => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  
  const [subcategoriaAEditar, setSubcategoriaAEditar] = useState(null);
  const [subcategoriaAEliminar, setSubcategoriaAEliminar] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resSub, resCat] = await Promise.all([
        axios.get('http://localhost:8080/api/subcategorias', config),
        axios.get('http://localhost:8080/api/categorias', config)
      ]);
      
      setSubcategorias(resSub.data);
      setCategorias(resCat.data);
    } catch (err) {
      setError('Ocurrió un error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevaSubcategoria.trim() || !categoriaSeleccionada) {
      alert('Por favor ingrese el nombre y seleccione una categoría.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/subcategorias', 
        { 
          nombre: nuevaSubcategoria,
          categoria: { id: parseInt(categoriaSeleccionada) },
          activo: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubcategorias([...subcategorias, response.data]);
      setShowCreateModal(false);
      setNuevaSubcategoria('');
      setCategoriaSeleccionada('');
    } catch (err) {
      alert('Error al crear la subcategoría');
    }
  };

  const abrirModalEditar = (subcat) => {
    const catId = subcat.categoria ? subcat.categoria.id : '';
    setSubcategoriaAEditar({ ...subcat, categoriaIdForm: catId });
    setShowEditModal(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!subcategoriaAEditar.nombre.trim() || !subcategoriaAEditar.categoriaIdForm) {
      alert('Por favor ingrese el nombre y seleccione una categoría.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/subcategorias/${subcategoriaAEditar.id}`, 
        { 
          nombre: subcategoriaAEditar.nombre,
          categoria: { id: parseInt(subcategoriaAEditar.categoriaIdForm) }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubcategorias(subcategorias.map(sub => sub.id === subcategoriaAEditar.id ? response.data : sub));
      setShowEditModal(false);
      setSubcategoriaAEditar(null);
    } catch (err) {
      alert('Error al actualizar la subcategoría');
    }
  };

  const abrirModalEliminar = (subcat) => {
    setSubcategoriaAEliminar(subcat);
    setShowDeleteModal(true);
  };

  const handleEliminar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/subcategorias/${subcategoriaAEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubcategorias(subcategorias.filter(sub => sub.id !== subcategoriaAEliminar.id));
      setShowDeleteModal(false);
      setSubcategoriaAEliminar(null);
    } catch (err) {
      alert('Error al eliminar la subcategoría.');
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
          <h1 className={styles.title}>Subcategorías</h1>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          Crear Nueva
        </button>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando subcategorías...</p>
        ) : subcategorias.length === 0 && !error ? (
          <p style={{ color: 'white' }}>No hay subcategorías registradas.</p>
        ) : (
          subcategorias.map((subcat) => (
            <div key={subcat.id} className={styles.itemRow}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.itemName}>{subcat.nombre}</span>
                <span style={{ fontSize: '12px', color: '#e0e0e0' }}>
                  Categoría: {subcat.categoria ? subcat.categoria.nombre : 'Sin categoría'}
                </span>
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => abrirModalEditar(subcat)}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => abrirModalEliminar(subcat)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Crear Nueva Subcategoría</h3>
            <form onSubmit={handleCrear}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nombre:</label>
              <input type="text" placeholder="Ej: Pintura exterior" value={nuevaSubcategoria} onChange={(e) => setNuevaSubcategoria(e.target.value)} style={inputStyle} autoFocus />
              
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Categoría Padre:</label>
              <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} style={inputStyle}>
                <option value="">-- Seleccione una categoría --</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>

              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowCreateModal(false); setNuevaSubcategoria(''); setCategoriaSeleccionada('');}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && subcategoriaAEditar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Editar Subcategoría</h3>
            <form onSubmit={handleEditar}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nombre:</label>
              <input type="text" value={subcategoriaAEditar.nombre} onChange={(e) => setSubcategoriaAEditar({...subcategoriaAEditar, nombre: e.target.value})} style={inputStyle} autoFocus />
              
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Categoría Padre:</label>
              <select value={subcategoriaAEditar.categoriaIdForm} onChange={(e) => setSubcategoriaAEditar({...subcategoriaAEditar, categoriaIdForm: e.target.value})} style={inputStyle}>
                <option value="">-- Seleccione una categoría --</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>

              <div style={buttonGroupStyle}>
                <button type="button" style={cancelBtnStyle} onClick={() => {setShowEditModal(false); setSubcategoriaAEditar(null);}}>Cancelar</button>
                <button type="submit" style={confirmBtnStyle}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && subcategoriaAEliminar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar la subcategoría <strong>"{subcategoriaAEliminar.nombre}"</strong>?</p>
            <p style={{fontSize: '12px', color: '#666'}}>Esta acción no se puede deshacer.</p>
            <div style={buttonGroupStyle}>
              <button style={cancelBtnStyle} onClick={() => {setShowDeleteModal(false); setSubcategoriaAEliminar(null);}}>Cancelar</button>
              <button style={deleteBtnStyle} onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubcategoriasAdmin;