import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './SolicitudesAdmin.module.css';
import { FaCamera, FaWrench, FaDollarSign } from "react-icons/fa";

const DetalleSolicitud = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Control de la caja de texto y comentarios
  const [mostrandoCajaTexto, setMostrandoCajaTexto] = useState(false);
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [estadoDestino, setEstadoDestino] = useState(null); // Almacena el ID del estado al que se quiere cambiar

  // Control del estado de carga al procesar cambios de estado
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [archivosReparacion, setArchivosReparacion] = useState([]);
  const [previewsReparacion, setPreviewsReparacion] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  // --- NUEVOS ESTADOS PARA MANEJAR EL COSTO DE REPARACIÓN ENTERO ---
  const [costoReparacion, setCostoReparacion] = useState('0');
  const [isSavingCosts, setIsSavingCosts] = useState(false);

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

  // Sincronizar el input con el costo proveniente del backend cuando la solicitud cambie
  useEffect(() => {
    if (solicitud) {
      setCostoReparacion(solicitud.costoReparacion?.toString() || '0');
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
        const msg = err.response?.data?.message || 'Error al cargar la solicitud';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCambioEstado = async (nuevoEstadoId, textoComentario = '') => {
    setError('');
    setSuccess('');
    setIsChangingStatus(true); // Encendemos el estado de carga
    try {
      // Enviamos el comentario estructurado al backend
      const res = await api.patch(`/solicitudes/${id}/estado/${nuevoEstadoId}`, {
        comentario: textoComentario 
      });
      
      const resEvidencias = await api.get(`/archivos-evidencia/solicitud/${id}`).catch(() => ({ data: [] }));
      
      setSolicitud({
        ...res.data,
        archivosEvidencia: resEvidencias.data
      });
      
      setSuccess('Estado actualizado y notificaciones enviadas.');
      
      // Limpieza de estados de control
      setMostrandoCajaTexto(false);
      setComentarioEstado('');
      setEstadoDestino(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Error al cambiar estado.';
        setError(msg);
      }
    } finally {
      setIsChangingStatus(false); // Apagamos el estado de carga al terminar
    }
  };

  // --- FUNCIÓN PARA GUARDAR EL COSTO EN EL BACKEND ---
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
      // Enviamos el valor plano al endpoint del controlador
      const res = await api.put(`/solicitudes/${id}/costos`, { monto: montoEntero });
      
      const resEvidencias = await api.get(`/archivos-evidencia/solicitud/${id}`).catch(() => ({ data: [] }));
      
      setSolicitud({
        ...res.data,
        archivosEvidencia: resEvidencias.data
      });

      setSuccess('Costo de reparación actualizado correctamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Error al guardar el costo.';
        setError(msg);
      }
    } finally {
      setIsSavingCosts(false);
    }
  };

  // Activa el flujo de comentarios según el botón presionado
  const abrirCajaComentario = (idEstado) => {
    setEstadoDestino(idEstado);
    setMostrandoCajaTexto(true);
  };

  // Cancela la acción actual y limpia el formulario
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Error al subir evidencias.';
        setError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEliminarEvidencia = (index) => {
    setArchivosReparacion(prev => prev.filter((_, i) => i !== index));
    setPreviewsReparacion(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div className={styles.container}><p style={{color: 'white', textAlign: 'center'}}>Cargando detalle...</p></div>;
  if (!solicitud) return <div className={styles.container}><p style={{color: 'white', textAlign: 'center'}}>Solicitud no encontrada.</p></div>;

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
      <div key={index} style={{ width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', position: 'relative', backgroundColor: '#fdfdfd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isPDF ? (
          <a href={evidencia.rutaArchivo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: '30px' }}>📄</div>
            <div style={{ fontSize: '10px', color: '#0d3b66', marginTop: '5px' }}>Ver PDF</div>
          </a>
        ) : (
          <a href={evidencia.rutaArchivo} target="_blank" rel="noopener noreferrer">
            <img src={evidencia.rutaArchivo} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </a>
        )}
      </div>
    );
  };

  // Helper para definir dinámicamente el color y texto del botón de confirmation
  const obtenerConfiguracionBoton = () => {
    switch(estadoDestino) {
      case ESTADOS.EN_PROCESO:
        return { texto: 'Confirmar En Proceso', color: '#ffc107', textoColor: '#333' };
      case ESTADOS.NO_APLICA:
        return { texto: 'Confirmar No Aplica', color: '#6c757d', colorTexto: 'white' };
      case ESTADOS.TERMINADO:
        return { texto: 'Confirmar Terminado', color: '#17a2b8', colorTexto: 'white' };
      default:
        return { texto: 'Realizar Cambios', color: '#28a745', colorTexto: 'white' };
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

      {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontWeight: 'bold' }}>{success}</div>}

      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', color: '#333' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Estado Actual: <span style={{ color: '#0d3b66' }}>{estadoActual}</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#666' }}>
               <p style={{ margin: 0 }}><strong>Fecha de Ingreso (Sistema):</strong> {formatearFecha(solicitud.fechaIngreso)}</p>
               <p style={{ margin: 0 }}><strong>Fecha de Hallazgo (Reportada):</strong> {formatearFechaCorta(solicitud.fechaHallazgo)}</p>
            </div>
          </div>
          
          {/* SECCIÓN INTERACTIVA DE BOTONES DE ESTADO */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            {!mostrandoCajaTexto ? (
              <>
                {estadoActual === 'Pendiente' && (
                  <>
                    <button 
                      onClick={() => abrirCajaComentario(ESTADOS.EN_PROCESO)} 
                      className={styles.estadoBtn}
                      style={{ backgroundColor: '#ffc107', color: '#333' }}
                    >
                      Marcar En Proceso
                    </button>
                    <button 
                      onClick={() => abrirCajaComentario(ESTADOS.NO_APLICA)} 
                      className={styles.estadoBtn}
                      style={{ backgroundColor: '#6c757d', color: 'white' }}
                    >
                      Marcar No Aplica
                    </button>
                  </>
                )}
                {estadoActual === 'En Proceso' && (
                   <button 
                     onClick={() => abrirCajaComentario(ESTADOS.TERMINADO)} 
                     className={styles.estadoBtn} 
                     style={{ backgroundColor: '#17a2b8', color: 'white' }}
                   >
                     Marcar Terminado
                   </button>
                )}
              </>
            ) : (
              /* CAJA DE TEXTO GENERALIZADA PARA CUALQUIER CAMBIO DE ESTADO */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                  placeholder={`Escribe una observación para el correo de notificación...`}
                  value={comentarioEstado}
                  disabled={isChangingStatus} // Bloquea la edición del texto mientras carga
                  onChange={(e) => setComentarioEstado(e.target.value)}
                  style={{
                    width: '300px',
                    height: '70px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '13px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    backgroundColor: isChangingStatus ? '#f5f5f5' : '#fff'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={cancelarCambioEstado}
                    disabled={isChangingStatus} // Evita cancelar la operation en medio del envío
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#e0e0e0',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isChangingStatus ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleCambioEstado(estadoDestino, comentarioEstado)} 
                    className={styles.estadoBtn}
                    disabled={isChangingStatus} // Deshabilita el clic reiterado
                    style={{ 
                      backgroundColor: isChangingStatus ? '#9e9e9e' : configBotonFinal.color, 
                      color: configBotonFinal.colorTexto || 'white',
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Categoría:</strong> {solicitud.subCategoria?.categoria?.nombre || 'N/A'}</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>Subcategoría:</strong> {solicitud.subCategoria?.nombre || 'N/A'}</p>
            <p style={{ margin: '0' }}><strong>Ubicación:</strong> {solicitud.ubicacionExacta}</p>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
             <p style={{ margin: '0 0 8px 0' }}><strong>Descripción del Problema:</strong></p>
             <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{solicitud.descripcion}</div>
          </div>
        </div>

        <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h3 style={{ 
            display: 'flex',            
            alignItems: 'center',      
            gap: '8px',                
            fontSize: '16px', 
            color: '#0d3b66', 
            marginBottom: '15px'
           }}>
            <FaCamera/> Evidencia Inicial (Hallazgo)</h3>
          
          {evidenciasEstado.length === 0 ? (
             <p style={{ fontSize: '13px', color: '#777', fontStyle: 'italic' }}>No se adjuntaron archivos al crear la solicitud.</p>
          ) : (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {evidenciasEstado.map((ev, index) => renderEvidenciaCard(ev, index))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ 
            display: 'flex',          
            alignItems: 'center',    
            gap: '8px',              
            fontSize: '16px', 
            color: '#28a745',         
            marginBottom: '15px'
           }}> <FaWrench /> Evidencia de Reparación</h3>
          
          {evidenciasReparacion.length > 0 && (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {evidenciasReparacion.map((ev, index) => renderEvidenciaCard(ev, index))}
            </div>
          )}

          {(estadoActual === 'En Proceso' || estadoActual === 'Terminado' || estadoActual === 'Aprobado') && (
            <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '6px', border: '1px dashed #adb5bd' }}>
              <input type="file" multiple hidden accept="image/*,.pdf" onChange={handleFileChange} ref={inputRef} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Adjuntar fotos del trabajo finalizado:</span>
                  <button type="button" onClick={() => inputRef.current.click()} style={{ padding: '6px 12px', backgroundColor: '#fff', color: '#0d3b66', border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Seleccionar Archivos
                  </button>
                </div>

                {previewsReparacion.length > 0 && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                       {previewsReparacion.map((p, i) => (
                         <div key={i} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' }}>
                           {p.tipo === 'application/pdf' ? (
                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '20px' }}>📄</div>
                           ) : (
                             <img src={p.url} alt="prev" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           )}
                           <button type="button" onClick={() => handleEliminarEvidencia(i)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(217, 83, 79, 0.9)', color: 'white', border: 'none', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>X</button>
                         </div>
                       ))}
                     </div>
                     <button type="button" onClick={handleSubirReparacion} disabled={isUploading} style={{ alignSelf: 'flex-start', padding: '8px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                       {isUploading ? 'Subiendo archivos...' : 'Guardar Evidencias'}
                     </button>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- NUEVA SECCIÓN: LIQUIDACIÓN FINANCIERA (CONTROL DE COSTO TOTAL) --- */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#0d3b66', marginBottom: '15px' }}>
            <FaDollarSign /> Liquidación Financiera (Postventa)
          </h3>

          {/* Validamos si el estado es Terminado o posterior (Aprobado) */}
          {(estadoActual !== 'Terminado' && estadoActual !== 'Aprobado') ? (
            <div style={{ padding: '15px', backgroundColor: '#eef2f5', borderRadius: '6px', borderLeft: '4px solid #7e9ab2', color: '#364a5e' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>
                El ingreso del costo final de la reparación estará disponible automáticamente cuando la solicitud cambie al estado <strong>Terminado</strong> o <strong>Aprobado</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleGuardarCosto} style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>Costo Total de Reparación ($):</label>
                <input
                  type="number"
                  placeholder="Ej: 6000000"
                  value={costoReparacion}
                  onChange={(e) => setCostoReparacion(e.target.value)}
                  disabled={isSavingCosts}
                  required
                  style={{ width: '220px', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginTop: '22px' }}>
                <button
                  type="submit"
                  disabled={isSavingCosts}
                  style={{
                    background: isSavingCosts ? '#ccc' : '#2a9d8f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '9px 20px',
                    cursor: isSavingCosts ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'background 0.2s'
                  }}
                >
                  {isSavingCosts ? 'Guardando...' : 'Guardar Costo Total'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default DetalleSolicitud;