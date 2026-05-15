import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SolicitudesAdmin.module.css';
import { FaCamera,FaWrench } from "react-icons/fa";

const DetalleSolicitud = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [archivosReparacion, setArchivosReparacion] = useState([]);
  const [previewsReparacion, setPreviewsReparacion] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

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

  const cargarDetalle = async () => {
    try {
      const token = localStorage.getItem('token');
      const resSol = await axios.get(`http://localhost:8080/api/solicitudes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitud(resSol.data);
    } catch (err) {
      setError('Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleCambioEstado = async (nuevoEstadoId) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:8080/api/solicitudes/${id}/estado/${nuevoEstadoId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitud(res.data);
      setSuccess('Estado actualizado y notificaciones enviadas.');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado.');
    }
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      archivosReparacion.forEach(f => formData.append('archivos', f));

      await axios.post(`http://localhost:8080/api/solicitudes/${id}/evidencia-reparacion`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Evidencias de reparación guardadas exitosamente.');
      setArchivosReparacion([]);
      setPreviewsReparacion([]);
      cargarDetalle(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al subir evidencias.');
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

  const listaEvidencias = solicitud.archivos || solicitud.archivoEvidencias || solicitud.evidencias || [];
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
  }

  const renderEvidenciaCard = (evidencia, index) => {
    const isPDF = evidencia.rutaArchivo.toLowerCase().endsWith('.pdf');
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
          
         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {estadoActual === 'Pendiente' && (
              <>
                <button 
                  onClick={() => handleCambioEstado(ESTADOS.EN_PROCESO)} 
                  className={styles.estadoBtn}
                  style={{backgroundColor: '#ffc107',color: '#333'}}
                >
                  Marcar En Proceso
                </button>
                <button 
                  onClick={() => handleCambioEstado(ESTADOS.NO_APLICA)} 
                  className={styles.estadoBtn}
                  style={{backgroundColor: '#6c757d',color: 'white'}}
                >
                  Marcar No Aplica
                </button>
              </>
            )}
            {estadoActual === 'En Proceso' && (
               <button onClick={() => handleCambioEstado(ESTADOS.TERMINADO)} className={styles.estadoBtn} style={{ backgroundColor: '#17a2b8', color: 'white' }}>Marcar Terminado</button>
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

          {(estadoActual === 'En Proceso' || estadoActual === 'Terminado') && (
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

      </div>
    </div>
  );
};

export default DetalleSolicitud;