import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './DetalleObra.module.css';
import { FaInfoCircle,FaCalendarAlt } from "react-icons/fa";
import { HiOutlineDocumentSearch } from "react-icons/hi";



const DetalleObra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarObra = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8080/api/obras/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setObra(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar los detalles de la obra.');
      } finally {
        setLoading(false);
      }
    };
    cargarObra();
  }, [id]);

  const formatearFechaCorta = (fechaString) => {
    if (!fechaString) return 'N/A';
    return new Date(fechaString).toLocaleDateString('es-CL');
  };

  if (loading) return <div className={styles.container}><p className={styles.loadingText}>Cargando detalles...</p></div>;
  if (error) return <div className={styles.container}><p className={styles.errorText}>{error}</p></div>;
  if (!obra) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>&#8592;</button>
          <h1 className={styles.title}>Detalle de Obra</h1>
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
            <div>
                <h2 className={styles.obraNombre}>{obra.nombre}</h2>
                <span className={`${styles.badge} ${obra.activo ? styles.badgeActiva : styles.badgeInactiva}`}>
                    {obra.activo ? 'Obra activa' : 'Obra inactiva'}
                </span>
            </div>
            
             <Link to={`/admin/obras/${obra.id}/solicitudes`} className={styles.btnSolicitudes}>
                Ver Solicitudes
             </Link>
        </div>

        <div className={styles.detailsGrid}>
          
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaInfoCircle />
            Información General</h3>
            <p className={styles.detailText}><strong>Empresa Cliente:</strong> {obra.empresaCliente?.razonSocial || 'N/A'}</p>
            <p className={styles.detailText}><strong>Dirección:</strong> {obra.direccion}</p>
            <p className={styles.detailText}><strong>Comuna:</strong> {obra.comuna?.nombre || 'N/A'}</p>
            <p className={styles.detailText}><strong>Región:</strong> {obra.comuna?.region?.nombre || 'N/A'}</p>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaCalendarAlt />
            Fechas y Documentos</h3>
            <div className={styles.detailRow}>
                <p><strong>Inicio Postventa:</strong></p>
                <span>{formatearFechaCorta(obra.fechaInicioPostventa)}</span>
            </div>
            <div className={styles.detailRow}>
                <p><strong>Cierre Postventa:</strong></p>
                <span>{formatearFechaCorta(obra.fechaCierrePostventa)}</span>
            </div>
            
            <div className={styles.actaContainer}>
                <p><strong>Acta de Entrega:</strong></p>
                {obra.rutaActaEntrega ? (
                  <a href={obra.rutaActaEntrega} target="_blank" rel="noopener noreferrer" className={styles.actaLink}>
                  <HiOutlineDocumentSearch /> Ver Documento PDF
                  </a>
                ) : (
                  <span className={styles.noActa}>Sin acta adjunta</span>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalleObra;