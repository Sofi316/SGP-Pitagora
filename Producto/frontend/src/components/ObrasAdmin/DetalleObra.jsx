import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './DetalleObra.module.css';
import { FaInfoCircle, FaCalendarAlt, FaUsers, FaEnvelope, FaMobileAlt } from "react-icons/fa";
import { HiOutlineDocumentSearch } from "react-icons/hi";

const DetalleObra = () => {
  const { id } = useParams();
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarObra = async () => {
      try {
        const res = await api.get(`/obras/${id}`);
        setObra(res.data);
      } catch (err) {
        if (err.response?.status !== 401) {
          const msg = err.response?.data?.message || 'Error al cargar los detalles de la obra.';
          setError(msg);
        }
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

  const gridUsuariosStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' };
  const cardUsuarioStyle = { padding: '15px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d3b66', borderRadius: '6px', fontSize: '14px', color: '#333' };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion/obras" className={styles.backButton} title="Volver a Obras">&#8592;</Link>
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
            
             <Link to={`/admin/solicitudes/empresa/${obra.empresaCliente?.id}`} className={styles.btnSolicitudes}>
                Ver Solicitudes
             </Link>
        </div>

        <div className={styles.detailsGrid}>
          
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaInfoCircle /> Información General</h3>
            <p className={styles.detailText}><strong>Empresa Cliente:</strong> {obra.empresaCliente?.razonSocial || 'N/A'}</p>
            <p className={styles.detailText}><strong>Dirección:</strong> {obra.direccion}</p>
            <p className={styles.detailText}><strong>Comuna:</strong> {obra.comuna?.nombre || 'N/A'}</p>
            <p className={styles.detailText}><strong>Región:</strong> {obra.comuna?.region?.nombre || 'N/A'}</p>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaCalendarAlt /> Fechas y Documentos</h3>
            <div className={styles.detailRow}>
                <p><strong>Inicio Postventa:</strong></p>
                <span>{formatearFechaCorta(obra.fechaInicioPostventa)}</span>
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

          <div className={styles.sectionCard} style={{ gridColumn: '1 / -1' }}>
            <h3 className={styles.sectionTitleIcons}><FaUsers /> Representantes Asociados</h3>
            
            {obra.usuarios && obra.usuarios.length > 0 ? (
                <div style={gridUsuariosStyle}>
                    {obra.usuarios.map(user => (
                        <div key={user.id} style={cardUsuarioStyle}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}><strong>{user.nombre} {user.apellido}</strong></p>
                            <p style={{ margin: '0 0 5px 0', color: '#666' }}>{user.cargo || 'Sin cargo definido'}</p>
                            <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center' }}>
                                <FaEnvelope style={{ color: '#0d3b66', marginRight: '8px' }} /> {user.correo}
                            </p>
                            <p style={{ margin: '0', display: 'flex', alignItems: 'center' }}>
                                <FaMobileAlt style={{ color: '#0d3b66', marginRight: '8px', fontSize: '16px' }} /> {user.celular || 'Sin celular'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>No hay representantes asignados a esta obra.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalleObra;