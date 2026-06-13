import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './SolicitudesAdmin.module.css';
import { FaCamera, FaWrench, FaDollarSign, FaUser, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

const DetalleSolicitud = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [mostrandoCajaTexto, setMostrandoCajaTexto] = useState(false);
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [estadoDestino, setEstadoDestino] = useState(null); 

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [archivosReparacion, setArchivosReparacion] = useState([]);
  const [previewsReparacion, setPreviewsReparacion] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const [costoReparacion, setCostoReparacion] = useState('0');
  const [isSavingCosts, setIsSavingCosts] = useState(false);
  const [costoBloqueado, setCostoBloqueado] = useState(false);

  const ESTADOS = {
    PENDIENTE: 1,
    EN_PROCESO: 2,
    TERMINADO: 3,
    APROBADO: 4,
    RECHAZADO: 5,
    NO_APLICA: 6
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  useEffect(() => {
    if (solicitud) {
      setCostoReparacion(solicitud.costoReparacion?.toString() || '0');
      if (solicitud.costoReparacion > 0) {
        setCostoBloqueado(true);
      }
    }
  }, [solicitud]);

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

  const handleCambioEstado = async (nuevoEstadoId, textoComentario = '') => {
    setError('');
    setSuccess('');
    setIsChangingStatus(true); 
    try {
      const res = await api.patch(`/solicitudes/${id}/estado/${nuevoEstadoId}`, {
        comentario: textoComentario 
      });
      
      const resEvidencias = await api.get(`/archivos-evidencia/solicitud/${id}`).catch(() => ({ data: [] }));
      
      setSolicitud({ ...res.data, archivosEvidencia: resEvidencias.data });
      setSuccess('Estado actualizado y notificaciones enviadas.');
      setMostrandoCajaTexto(false);
      setComentarioEstado('');
      setEstadoDestino(null);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Error al cambiar estado.');
      }
    } finally {
      setIsChangingStatus(false); 
    }
  };

  const handleGuardarCosto = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const montoEntero = parseInt(costoReparacion, 10);
    if (isNaN(montoEntero) || montoEntero < 0) {
      setError('Por favor, ingresa un número entero válido y mayor o igual a cero.');
      return;
    }

    setIsSavingCosts(true);
    try {
      const res = await api.put(`/solicitudes/${id}/costos`, { monto: montoEntero });
      const resEvidencias = await api.get(`/archivos-evidencia/solicitud/${id}`).catch(() => ({ data: [] }));
      
      setSolicitud({ ...res.data, archivosEvidencia: resEvidencias.data });
      setSuccess('Costo de reparación actualizado correctamente.');
      setCostoBloqueado(true);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Error al guardar el costo.');
      }
    } finally {
      setIsSavingCosts(false);
    }
  };

  const abrirCajaComentario = (idEstado) => {
    setEstadoDestino(idEstado);
    setMostrandoCajaTexto(true);
  };

  const cancelarCambioEstado = () => {
    setMostrandoCajaTexto(false);
    setComentarioEstado('');
    setEstadoDestino(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setArchivosReparacion(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewsReparacion(prev => [...prev, { url: file.type.startsWith('image/') ? reader.result : null, tipo: file.type, nombre: file.name }]);
      if (file.type.startsWith('image/')) reader.readAsDataURL(file);
      else reader.onloadend();
    });
    e.target.value = '';
  };

  const handleSubirReparacion = async () => {
    if (archivosReparacion.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      archivosReparacion.forEach(f => formData.append('archivos', f));

      await api.post(`/solicitudes/${id}/evidencia-reparacion`, formData);
      setSuccess('Evidencias de reparación guardadas exitosamente.');
      setArchivosReparacion([]);
      setPreviewsReparacion([]);
      cargarDetalle(); 
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Error al subir evidencias.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEliminarEvidencia = (index) => {
    setArchivosReparacion(prev => prev.filter((_, i) => i !== index));
    setPreviewsReparacion(prev => prev.filter((_, i) => i !== index));
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

  const obtenerConfiguracionBoton = () => {
    switch(estadoDestino) {
      case ESTADOS.EN_PROCESO: return { texto: 'Confirmar En Proceso', color: '#ffc107', textoColor: '#333' };
      case ESTADOS.NO_APLICA: return { texto: 'Confirmar No Aplica', color: '#6c757d', textoColor: 'white' };
      case ESTADOS.TERMINADO: return { texto: 'Confirmar Terminado', color: '#17a2b8', textoColor: 'white' };
      default: return { texto: 'Realizar Cambios', color: '#28a745', textoColor: 'white' };
    }
  };

  const configBotonFinal = obtenerConfiguracionBoton();

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>&#8592;</button>
          <h1 className={styles.title}>Solicitud #{solicitud.id} - {solicitud.obra?.nombre}</h1>
        </div>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}

      <div className={styles.detailCard}>
        
        <div className={styles.sectionHeaderRow}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
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
          
          <div className={styles.estadoActions}>
            {!mostrandoCajaTexto ? (
              <>
                {estadoActual === 'Pendiente' && (
                  <>
                    <button onClick={() => abrirCajaComentario(ESTADOS.EN_PROCESO)} className={styles.estadoBtn} style={{ backgroundColor: '#ffc107', color: '#333' }}>
                      Marcar En Proceso
                    </button>
                    <button onClick={() => abrirCajaComentario(ESTADOS.NO_APLICA)} className={styles.estadoBtn} style={{ backgroundColor: '#6c757d', color: 'white' }}>
                      Marcar No Aplica
                    </button>
                  </>
                )}
                {estadoActual === 'En Proceso' && (
                   <button onClick={() => abrirCajaComentario(ESTADOS.TERMINADO)} className={styles.estadoBtn} style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                     Marcar Terminado
                   </button>
                )}
              </>
            ) : (
              <div className={styles.comentarioBox}>
                <textarea
                  placeholder={`Escribe una observación para el correo de notificación...`}
                  value={comentarioEstado}
                  disabled={isChangingStatus} 
                  onChange={(e) => setComentarioEstado(e.target.value)}
                  className={`${styles.comentarioTextarea} ${isChangingStatus ? styles.comentarioTextareaDisabled : styles.comentarioTextareaActive}`}
                />
                <div className={styles.comentarioBtnGroup}>
                  <button
                    onClick={cancelarCambioEstado}
                    disabled={isChangingStatus} 
                    className={`${styles.cancelBtn} ${isChangingStatus ? styles.cancelBtnDisabled : styles.cancelBtnActive}`}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleCambioEstado(estadoDestino, comentarioEstado)} 
                    className={styles.estadoBtn}
                    disabled={isChangingStatus} 
                    style={{ 
                      backgroundColor: isChangingStatus ? '#9e9e9e' : configBotonFinal.color, 
                      color: configBotonFinal.textoColor || 'white',
                      cursor: isChangingStatus ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isChangingStatus ? 'Cargando...' : configBotonFinal.texto}
                  </button>
                </div>
              </div>
            )}
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
        
        {estadoActual === 'Pendiente' ? (
          <div className={styles.costoInfoBox}>
            <p className={styles.costoInfoText}>
              La opción para adjuntar evidencia de reparación estará disponible automáticamente cuando la solicitud cambie al estado <strong>En Proceso</strong>.
            </p>
          </div>
        ) : (
          <>
            {evidenciasReparacion.length > 0 && (
              <div className={styles.evidenciaList}>
                {evidenciasReparacion.map((ev, index) => renderEvidenciaCard(ev, index))}
              </div>
            )}

            {estadoActual === 'En Proceso' && (
              <div className={styles.uploadBox}>
                <input type="file" multiple hidden accept="image/*,.pdf" onChange={handleFileChange} ref={inputRef} />
              <div className={styles.uploadForm}>
                <div className={styles.uploadHeader}>
                  <span className={styles.uploadLabel}>Adjuntar fotos del trabajo finalizado:</span>
                  <button type="button" onClick={() => inputRef.current.click()} className={styles.uploadBtn}>
                    + Seleccionar Archivos
                  </button>
                </div>

                {previewsReparacion.length > 0 && (
                   <div className={styles.previewContainer}>
                     <div className={styles.previewList}>
                       {previewsReparacion.map((p, i) => (
                         <div key={i} className={styles.previewCard}>
                           {p.tipo === 'application/pdf' ? (
                             <div className={styles.pdfIconLarge} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>📄</div>
                           ) : (
                             <img src={p.url} alt="prev" className={styles.evidenciaImg} />
                           )}
                           <button type="button" onClick={() => handleEliminarEvidencia(i)} className={styles.deleteBtn}>X</button>
                         </div>
                       ))}
                     </div>
                     <button type="button" onClick={handleSubirReparacion} disabled={isUploading} className={styles.saveEvidenciaBtn}>
                       {isUploading ? 'Subiendo archivos...' : 'Guardar Evidencias'}
                     </button>
                   </div>
                )}
              </div>
            </div>
          )}
          </>
           )}
        </div>

        <div className={styles.dividerSection}>
          <h3 className={styles.subTitleBlue}><FaDollarSign /> Liquidación Financiera (Postventa)</h3>

          {!(estadoActual === 'Terminado' || estadoActual === 'Aprobado' || estadoActual === 'Rechazado') ? (
            <div className={styles.costoInfoBox}>
              <p className={styles.costoInfoText}>
                El ingreso del costo final de la reparación estará disponible automáticamente cuando la solicitud alcance la etapa de cierre (<strong>Terminado</strong>, <strong>Aprobado</strong> o <strong>Rechazado</strong>).
              </p>
            </div>
          ) : (
            <form onSubmit={handleGuardarCosto} className={styles.costoForm}>
              <div className={styles.costoInputGroup}>
                <label className={styles.costoLabel}>Costo Total de Reparación ($):</label>
                <input
                  type="number"
                  placeholder="Ej: 6000000"
                  value={costoReparacion}
                  onChange={(e) => setCostoReparacion(e.target.value)}
                  disabled={isSavingCosts || costoBloqueado}
                  required
                  className={`${styles.costoInput} ${costoBloqueado ? styles.costoInputDisabled : styles.costoInputActive}`}
                />
              </div>

              <div className={styles.costoBtnGroup}>
                {!costoBloqueado ? (
                  <button
                    type="submit"
                    disabled={isSavingCosts}
                    className={`${styles.saveCostoBtn} ${isSavingCosts ? styles.saveCostoBtnDisabled : styles.saveCostoBtnActive}`}
                  >
                    {isSavingCosts ? 'Guardando...' : 'Guardar Costo Total'}
                  </button>
                ) : (
                  <button type="button" onClick={(e) => { e.preventDefault(); setCostoBloqueado(false); }} className={styles.modCostoBtn}>
                    Modificar Costo
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default DetalleSolicitud;