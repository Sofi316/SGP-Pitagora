import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './SolicitudesAdmin.module.css';

const SolicitudesAdmin = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const resEmpresas = await axios.get('http://localhost:8080/api/empresas-clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpresas(resEmpresas.data);
    } catch (err) {
      setError('Ocurrió un error al cargar las empresas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Solicitudes</h1>
        <div className={styles.headerButtons}>
          <button className={styles.editClientBtn} onClick={() => navigate('/admin/gestion/empresas')}>
            Editar cliente
          </button>
          <button className={styles.createClientBtn} onClick={() => navigate('/admin/gestion/empresas')}>
            Crear cliente
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando empresas...</p>
        ) : empresas.length === 0 ? (
          <p style={{ color: 'white' }}>No hay empresas registradas.</p>
        ) : (
          empresas.map((empresa) => (
            <div 
              key={`emp-${empresa.id}`} 
              className={`${styles.itemRow} ${styles.empresaRow}`} 
              onClick={() => navigate(`/admin/solicitudes/empresa/${empresa.id}`)}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.itemName}>{empresa.razonSocial}</span>
                <span style={{ fontSize: '12px', color: '#e0e0e0' }}>RUT: {empresa.rut}</span>
              </div>
              <span className={styles.indicator}>Abrir ►</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SolicitudesAdmin;