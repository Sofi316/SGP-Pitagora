import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from '../ClientSolicitudes/ClientSolicitudes.module.css';
import { FaCamera, FaWrench, FaUser, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

const ClientDetalleSolicitud = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDetalle = async () => {
    setLoading(true);
    try {
      const [resSol, resEvidencias] = await Promise.all([
        api.get(`/solicitudes/${id}`),
        api.get(`/archivos-evidencia/solicitud/${id}`).catch(() => ({ data: [] }))
      ]);

      setSolicitud({
        ...resSol.data,
        archivosEvidencia: resEvidencias.data
      });
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Error al cargar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}><p className={styles.emptyText} style={{textAlign: 'center'}}>Cargando detalle...</p></div>;
  if (!solicitud) return <div className={styles.container}><p className={styles.emptyText} style={{textAlign: 'center'}}>Solicitud no encontrada.</p></div>;

  const estadoActual = solicitud.estadoSolicitud?.nombre || '';
  const listaEvidencias = solicitud.archivosEvidencia || [];
  const evidenciasEstado = listaEvidencias.filter(e => e.tipoEvidencia?.id === 1);
  const evidenciasReparacion = listaEvidencias.filter(e => e.tipoEvidencia?.id === 2);

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-CL', opciones);
  };
  
  const formatearFechaCorta = (fechaString) => {
    if (!fechaString) return 'N/A';
    return new Date(fechaString).toLocaleDateString('es-CL');
  };

  const renderEvidenciaCard = (evidencia, index) => {
    const isPDF = evidencia.rutaArchivo?.toLowerCase().endsWith('.pdf');
    return (
      <div key={index} className={styles.evidenciaCard}>
        {isPDF ? (
          <a href={evidencia.rutaArchivo} target="_blank" rel="noopener noreferrer" className={styles.evidenciaLink}>
            <div className={styles.pdfIconLarge}>📄</div>
            <div className={styles.pdfTextSmall}>Ver PDF</div>
          </a>
        ) : (
          <a href={evidencia.rutaArchivo} target="_blank" rel="noopener noreferrer" className={styles.evidenciaLink}>
            <img src={evidencia.rutaArchivo} alt="Evidencia" className={styles.evidenciaImg} />
          </a>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>&#8592;</button>
          <h1 className={styles.title}>Solicitud #{solicitud.id} - {solicitud.obra?.nombre}</h1>
        </div>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}

      <div className={styles.detailCard}>
        
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Estado Actual: <span className={styles.statusHighlight}>{estadoActual}</span></h2>
            <div className={styles.metaInfoList}>
               <p className={styles.metaInfoItem}>
                 <strong><FaUser className={styles.metaIcon}/>Creado por:</strong> {solicitud.usuario ? `${solicitud.usuario.nombre} ${solicitud.usuario.apellido} (${solicitud.usuario.rol?.nombre})` : 'Desconocido'}
               </p>
               <p className={styles.metaInfoItem}>
                 <strong><FaCalendarAlt className={styles.metaIcon}/>Fecha de Ingreso (Sistema):</strong> {formatearFecha(solicitud.fechaIngreso)}
               </p>
               <p className={styles.metaInfoItem}>
                 <strong><FaCalendarAlt className={styles.metaIcon}/>Fecha de Hallazgo (Reportada):</strong> {formatearFechaCorta(solicitud.fechaHallazgo)}
               </p>
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <p className={styles.infoText}><strong>Categoría:</strong> {solicitud.subCategoria?.categoria?.nombre || 'N/A'}</p>
            <p className={styles.infoText}><strong>Subcategoría:</strong> {solicitud.subCategoria?.nombre || 'N/A'}</p>
            <p className={styles.infoTextLast}><strong>Ubicación:</strong> {solicitud.ubicacionExacta}</p>
          </div>
          <div className={styles.infoBox}>
             <p className={styles.infoText}><strong>Descripción del Problema:</strong></p>
             <div className={styles.descriptionText}>{solicitud.descripcion}</div>
          </div>
        </div>

        {/* BLOQUE DE CIERRE Y CONFORMIDAD */}
        {(solicitud.motivoRechazo || solicitud.comentarioCierre || (solicitud.calificacion && solicitud.calificacion > 0) || solicitud.fechaFirma) && (
          <div className={styles.dividerSection}>
            <h3 className={styles.subTitleBlue}><FaCheckCircle /> Cierre y Conformidad del Cliente</h3>
            <div className={styles.infoBox}>
              {solicitud.motivoRechazo && (
                <p className={styles.infoText}><strong>Motivo de Rechazo:</strong> {solicitud.motivoRechazo}</p>
              )}
              {solicitud.comentarioCierre && (
                <p className={styles.infoText}><strong>Comentario de Cierre:</strong> {solicitud.comentarioCierre}</p>
              )}
              {solicitud.calificacion > 0 && (
                <p className={styles.infoText}>
                  <strong>Calificación:</strong> 
                  <span style={{ color: '#ffc107', fontSize: '18px', marginLeft: '5px' }}>
                    {'★'.repeat(solicitud.calificacion)}{'☆'.repeat(5 - solicitud.calificacion)}
                  </span>
                </p>
              )}
              {solicitud.fechaFirma && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                  <p className={styles.infoTextLast}>
                    <strong><FaCalendarAlt className={styles.metaIcon} /> Fecha de Resolución:</strong> {formatearFecha(solicitud.fechaFirma)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.dividerSection}>
          <h3 className={styles.subTitleBlue}><FaCamera/> Evidencia Inicial (Hallazgo)</h3>
          
          {evidenciasEstado.length === 0 ? (
             <p className={styles.emptyItalic}>No se adjuntaron archivos al crear la solicitud.</p>
          ) : (
            <div className={styles.evidenciaList}>
              {evidenciasEstado.map((ev, index) => renderEvidenciaCard(ev, index))}
            </div>
          )}
        </div>

        <div className={styles.dividerSection}>
          <h3 className={styles.subTitleGreen}><FaWrench /> Evidencia de Reparación</h3>
          
          {evidenciasReparacion.length > 0 ? (
            <div className={styles.evidenciaList}>
              {evidenciasReparacion.map((ev, index) => renderEvidenciaCard(ev, index))}
            </div>
          ) : (
            <p className={styles.emptyItalic}>Aún no se ha adjuntado evidencia de reparación.</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClientDetalleSolicitud;
