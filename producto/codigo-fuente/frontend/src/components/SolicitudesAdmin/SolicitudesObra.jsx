import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './SolicitudesAdmin.module.css';
import imageCompression from 'browser-image-compression';

const SolicitudesObras = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [empresa, setEmpresa] = useState(null);
  const [obras, setObras] = useState([]);
  const [solicitudesPorObra, setSolicitudesPorObra] = useState({});
  const [loadingObraId, setLoadingObraId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [obrasExpandidas, setObrasExpandidas] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [obraSeleccionadaModal, setObraSeleccionadaModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [listaCategorias, setListaCategorias] = useState([]);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [formSolicitud, setFormSolicitud] = useState({ descripcion: '', ubicacion: '', idSubcategoria: '' });
  
  const [evidencias, setEvidencias] = useState([]);
  const [previewsEvidencias, setPreviewsEvidencias] = useState([]);
  const inputArchivoRef = useRef(null);

  useEffect(() => {
    cargarDatosBasicos();
    cargarCategorias();
  }, [id]);

  const cargarDatosBasicos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resEmpresa, resObras] = await Promise.all([
        axios.get(`http://localhost:8080/api/empresas-clientes/${id}`, config),
        axios.get(`http://localhost:8080/api/obras/empresa/${id}`, config).catch(() => ({ data: [] }))
      ]);
      
      setEmpresa(resEmpresa.data);
      setObras(resObras.data);
    } catch (err) {
      setError('Ocurrió un error al cargar los datos de la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/categorias', { headers: { Authorization: `Bearer ${token}` } });
      setListaCategorias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!categoriaSeleccionada) {
      setSubcategoriasDisponibles([]);
      return;
    }
    const obtenerSubcategorias = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8080/api/subcategorias/categoria/${categoriaSeleccionada}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubcategoriasDisponibles(res.data || []);
      } catch (error) {
        setSubcategoriasDisponibles([]);
      }
    };
    obtenerSubcategorias();
  }, [categoriaSeleccionada]);

  const toggleObra = async (obraId) => {
    if (obrasExpandidas.includes(obraId)) {
      setObrasExpandidas(obrasExpandidas.filter(expId => expId !== obraId));
      return;
    } 

    setObrasExpandidas([...obrasExpandidas, obraId]);

    if (!solicitudesPorObra[obraId]) {
      setLoadingObraId(obraId); 
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const resSolicitudes = await axios.get(`http://localhost:8080/api/solicitudes/obra/${obraId}`, config);
        
        setSolicitudesPorObra(prev => ({ ...prev, [obraId]: resSolicitudes.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingObraId(null); 
      }
    }
  };

  const abrirModalCrear = (obra) => {
    setObraSeleccionadaModal(obra);
    setFormSolicitud({ descripcion: '', ubicacion: '', idSubcategoria: '' });
    setCategoriaSeleccionada('');
    setEvidencias([]);
    setPreviewsEvidencias([]);
    setModalError('');
    setMensajeExito('');
    setShowCreateModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidencias(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewsEvidencias(prev => [...prev, {
          url: file.type.startsWith('image/') ? reader.result : null,
          tipo: file.type,
          nombre: file.name
        }]);
      };
      if (file.type.startsWith('image/')) { reader.readAsDataURL(file); } 
      else { reader.onloadend(); }
    });
  };

  const handleEliminarEvidencia = (index) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
    setPreviewsEvidencias(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!categoriaSeleccionada || !formSolicitud.idSubcategoria || !formSolicitud.ubicacion.trim() || !formSolicitud.descripcion.trim()) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }

    setModalLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      const solicitudData = {
        descripcion: formSolicitud.descripcion.trim(),
        ubicacionExacta: formSolicitud.ubicacion.trim(),
        fechaHallazgo: new Date().toISOString().split('T')[0], 
        activo: true,
        obra: { id: obraSeleccionadaModal.id },
        estadoSolicitud: { id: 1 }, 
        subCategoria: { id: parseInt(formSolicitud.idSubcategoria) }
      };

      formData.append('solicitud', new Blob([JSON.stringify(solicitudData)], { type: 'application/json' }));

      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };

      for (const file of evidencias) {
        if (file.type.startsWith('image/')) {
          try {
            const compressedFile = await imageCompression(file, options);
            formData.append('archivos', compressedFile, file.name);
          } catch (error) {
             formData.append('archivos', file); 
          }
        } else {
          formData.append('archivos', file);
        }
      }

      const response = await axios.post('http://localhost:8080/api/solicitudes', formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      const nuevaSolicitud = response.data;
      setSolicitudesPorObra(prev => ({
        ...prev,
        [obraSeleccionadaModal.id]: [...(prev[obraSeleccionadaModal.id] || []), nuevaSolicitud]
      }));

      setMensajeExito('¡Solicitud registrada con éxito!');
      setTimeout(() => setShowCreateModal(false), 1500);

    } catch (error) {
      setModalError(error.response?.data?.message || "Error al registrar la solicitud");
    } finally {
      setModalLoading(false);
    }
  };

  const getColorPorEstado = (nombreEstado) => {
    if (!nombreEstado) return '#ff9800'; 
    const est = nombreEstado.toLowerCase();
    if (est.includes('pendiente')) return '#e79417'; 
    if (est.includes('proceso')) return '#ffeb3b';   
    if (est.includes('terminado')) return '#45a8f8'; 
    if (est.includes('no aplica')) return '#5c5b5b'; 
    if (est.includes('aprobado')) return '#4caf50';  
    if (est.includes('rechazado')) return '#f44336'; 
    return '#ffffff';
  };

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', color: '#333' };
  const inputStyle = { width: '100%', padding: '8px', margin: '8px 0 15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' };
  const btnStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={() => navigate('/admin/solicitudes')}>
            &#8592;
          </button>
          <h1 className={styles.title}>
            {empresa ? empresa.razonSocial : 'Cargando...'}
          </h1>
        </div>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando obras...</p>
        ) : obras.length === 0 ? (
          <p style={{ color: 'white' }}>No hay obras asociadas a esta empresa.</p>
        ) : (
          obras.map((obra) => {
            const isObraExpanded = obrasExpandidas.includes(obra.id);
            const solicitudesDeObra = solicitudesPorObra[obra.id] || [];

            return (
              <div key={`obra-${obra.id}`} className={styles.accordionGroup}>
                <div 
                  className={`${styles.itemRow} ${styles.obraRow}`} 
                  onClick={() => toggleObra(obra.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span className={styles.itemName}>{obra.nombre}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                      className={styles.createClientBtn} 
                      onClick={(e) => { e.stopPropagation(); abrirModalCrear(obra); }}
                      style={{ padding: '6px 12px', fontSize: '13px', margin: 0 }}
                    >
                      + Nueva Solicitud
                    </button>
                    <span className={styles.indicator} style={{ minWidth: '20px', textAlign: 'center' }}>
                      {isObraExpanded ? '▲' : '▼'} 
                    </span>
                  </div>
                </div>

                {isObraExpanded && (
                  <div className={styles.solicitudesWrapper}>
                    {loadingObraId === obra.id ? (
                       <p className={styles.emptyText} style={{ textAlign: 'center' }}>Cargando solicitudes...</p>
                    ) : solicitudesDeObra.length === 0 ? (
                      <p className={styles.emptyText}>No hay solicitudes para esta obra.</p>
                    ) : (
                      <>
                        <div className={styles.solicitudesHeader}>
                          <span className={styles.colId}>ID</span>
                          <span className={styles.colObs}>Observación</span>
                          <span className={styles.colEstado}>Estado</span>
                        </div>

                        {solicitudesDeObra.map((solicitud) => (
                          <Link key={`sol-${solicitud.id}`} to={`/admin/solicitudes/${solicitud.id}`} className={styles.solicitudRowLink}>
                            <span className={styles.colId}>{solicitud.id}</span>
                            <span className={styles.colObs}>{solicitud.descripcion || 'Sin observación'}</span>
                            <span className={styles.colEstado} style={{ color: getColorPorEstado(solicitud.estadoSolicitud?.nombre), fontWeight: 'bold' }}>
                              {solicitud.estadoSolicitud?.nombre || 'Pendiente'}
                            </span>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && obraSeleccionadaModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginBottom: '20px', color: '#0d3b66', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
              Nueva Solicitud - {obraSeleccionadaModal.nombre}
            </h3>
            
            {mensajeExito && <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '15px' }}>{mensajeExito}</p>}
            {modalError && <p style={{ color: '#d9534f', fontSize: '13px', margin: '0 0 15px 0', fontWeight: 'bold' }}>{modalError}</p>}
            
            <form onSubmit={handleSubmitModal}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Categoría:</label>
                  <select 
                    value={categoriaSeleccionada} 
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)} 
                    style={inputStyle}
                  >
                    <option value="">Seleccione...</option>
                    {listaCategorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Subcategoría:</label>
                  <select 
                    value={formSolicitud.idSubcategoria} 
                    onChange={(e) => setFormSolicitud({...formSolicitud, idSubcategoria: e.target.value})} 
                    disabled={!categoriaSeleccionada} 
                    style={inputStyle}
                  >
                    <option value="">{categoriaSeleccionada ? "Seleccione..." : "Elija categoría"}</option>
                    {subcategoriasDisponibles.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                  </select>
                </div>
              </div>

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Ubicación Exacta:</label>
              <input 
                type="text" 
                value={formSolicitud.ubicacion} 
                onChange={(e) => setFormSolicitud({...formSolicitud, ubicacion: e.target.value})} 
                placeholder="Ej: Piso 3, Baño Oriente..." 
                style={inputStyle} 
              />

              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Descripción del Hallazgo:</label>
              <textarea 
                value={formSolicitud.descripcion} 
                onChange={(e) => setFormSolicitud({...formSolicitud, descripcion: e.target.value})} 
                placeholder="Detalle el problema..." 
                style={{ ...inputStyle, height: '80px', resize: 'vertical' }} 
              />

              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px dashed #ccc', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Evidencia Visual (Opcional):</label>
                  <button type="button" onClick={() => inputArchivoRef.current.click()} style={{ ...btnStyle, backgroundColor: '#e9ecef', color: '#0d3b66', padding: '4px 10px', fontSize: '12px', border: '1px solid #ced4da' }}>
                    + Adjuntar
                  </button>
                </div>
                <input type="file" multiple hidden accept="image/*,.pdf" onChange={handleFileChange} ref={inputArchivoRef} />

                {previewsEvidencias.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {previewsEvidencias.map((item, i) => (
                      <div key={i} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        {item.tipo === 'application/pdf' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#fdfdfd', fontSize: '24px' }}>📄</div>
                        ) : (
                          <img src={item.url} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <button type="button" onClick={() => handleEliminarEvidencia(i)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(217, 83, 79, 0.9)', color: 'white', border: 'none', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" style={{ ...btnStyle, backgroundColor: '#ccc', color: '#333' }} onClick={() => setShowCreateModal(false)} disabled={modalLoading}>Cancelar</button>
                <button type="submit" style={{ ...btnStyle, backgroundColor: '#0d3b66', color: '#fff' }} disabled={modalLoading}>
                  {modalLoading ? 'Guardando...' : 'Finalizar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesObras;