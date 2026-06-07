import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaInfoCircle } from 'react-icons/fa';
import api from '../../services/api';
import styles from './ConformidadCliente.module.css';

const ConformidadCliente = () => {
  const { token } = useParams();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const [accion, setAccion] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  // Estados para el Modal de Calificación
  const [showModal, setShowModal] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await api.get(`/solicitudes/public/conformidad/${token}`);
        setSolicitud(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data || 'El enlace es inválido o ha expirado.');
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitud();
  }, [token]);

  const handleAbrirModal = (tipoAccion) => {
    setSubmitError('');
    if (tipoAccion === 'RECHAZADO' && !motivoRechazo.trim()) {
      setSubmitError('Debe ingresar el motivo del rechazo antes de continuar.');
      return;
    }
    setAccion(tipoAccion);
    setShowModal(true);
  };

  const handleEnviarFinal = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        conforme: accion === 'APROBADO',
        motivoRechazo: accion === 'RECHAZADO' ? motivoRechazo : null,
        calificacion: calificacion > 0 ? calificacion : null
      };

      await api.post(`/solicitudes/public/conformidad/${token}`, payload);
      setShowModal(false);
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data || 'Error al procesar su respuesta.');
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.container}><div className={styles.messageBox}><p>Cargando información...</p></div></div>;
  if (error) return <div className={styles.container}><div className={styles.errorBox}><FaInfoCircle size={40} style={{ marginBottom: '15px' }} /><h3>No se pudo acceder</h3><p>{error}</p></div></div>;
  if (success) return <div className={styles.container}><div className={styles.successBox}><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg><h3>Respuesta Registrada</h3><p>Su conformidad ha sido procesada exitosamente.</p></div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.mainCard}>
        <div className={styles.header}>
          <h2>Evaluación de Trabajo Realizado</h2>
          <span className={styles.idBadge}>Solicitud ID-{solicitud.id}</span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}><span className={styles.infoLabel}>Categoría</span><span className={styles.infoValue}>{solicitud.categoriaNombre} - {solicitud.subCategoriaNombre}</span></div>
          <div className={styles.infoItem}><span className={styles.infoLabel}>Obra</span><span className={styles.infoValue}>{solicitud.obraNombre}</span></div>
          <div className={styles.infoItem}><span className={styles.infoLabel}>Fecha de Ingreso</span><span className={styles.infoValue}>{new Date(solicitud.fechaIngreso).toLocaleDateString()}</span></div>
          <div className={styles.infoItem}><span className={styles.infoLabel}>Ubicación Exacta</span><span className={styles.infoValue}>{solicitud.ubicacionExacta}</span></div>
        </div>

        <div className={styles.descriptionBox}>
          <span className={styles.infoLabel}>Descripción del problema</span>
          <p>{solicitud.descripcion}</p>
        </div>

        {solicitud.evidencias && solicitud.evidencias.length > 0 && (
          <div className={styles.descriptionBox}>
            <span className={styles.infoLabel}>Evidencia Adjunta</span>
            <div className={styles.imageGrid}>
              {solicitud.evidencias.map((img, idx) => (
                <img key={idx} src={img.rutaArchivo} alt={`Evidencia ${idx}`} className={styles.evidenciaImg} />
              ))}
            </div>
          </div>
        )}

        <div className={styles.actionForm}>
          <h3 className={styles.formTitle}>¿Está conforme con el trabajo realizado?</h3>
          
          <div className={styles.buttonGroup}>
            <button type="button" className={`${styles.btnAction} ${styles.btnAprobado}`} onClick={() => handleAbrirModal('APROBADO')}>
              Sí, Aprobar Trabajo
            </button>
            <button type="button" className={`${styles.btnAction} ${accion === 'RECHAZADO' ? styles.btnRechazadoActive : styles.btnRechazado}`} onClick={() => { setAccion('RECHAZADO'); setSubmitError(''); }}>
              No, Rechazar Trabajo
            </button>
          </div>

          {accion === 'RECHAZADO' && (
            <div className={styles.rejectContainer}>
              <label className={styles.inputLabel}>Indique la razón del rechazo (Obligatorio)</label>
              <textarea className={styles.textArea} value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} placeholder="Detalle los motivos..." rows="4" />
              {submitError && <div className={styles.errorMessage} style={{marginTop: '10px'}}>{submitError}</div>}
              <div style={{textAlign: 'right', marginTop: '10px'}}>
                <button type="button" className={styles.btnSubmitRechazo} onClick={() => handleAbrirModal('RECHAZADO')}>Continuar con el rechazo</button>
              </div>
            </div>
          )}
          {submitError && accion !== 'RECHAZADO' && <div className={styles.errorMessage}>{submitError}</div>}
        </div>
      </div>

      {/* MODAL DE CALIFICACIÓN */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Ayúdenos a mejorar</h3>
            <p className={styles.modalText}>¿Cómo calificaría el servicio de postventa recibido? (Opcional)</p>
            
            <div className={styles.stars}>
              {[...Array(5)].map((star, index) => {
                const currentRating = index + 1;
                return (
                  <label key={index}>
                    <input type="radio" name="rating" value={currentRating} onClick={() => setCalificacion(currentRating)} style={{ display: 'none' }} />
                    <FaStar size={40} className={styles.starIcon} color={currentRating <= (hover || calificacion) ? "#ffc107" : "#e4e5e9"} onMouseEnter={() => setHover(currentRating)} onMouseLeave={() => setHover(null)} />
                  </label>
                );
              })}
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancelar</button>
              <button type="button" className={styles.btnPrimary} onClick={handleEnviarFinal} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Finalizar y Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConformidadCliente;