import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import imageCompression from 'browser-image-compression';

const ModalCrearSolicitud = ({ show, onClose, obra, onSolicitudCreada }) => {
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
    if (show) {
      cargarCategorias();
      setFormSolicitud({ descripcion: '', ubicacion: '', idSubcategoria: '' });
      setCategoriaSeleccionada('');
      setEvidencias([]);
      setPreviewsEvidencias([]);
      setModalError('');
      setMensajeExito('');
    }
  }, [show]);

  useEffect(() => {
    if (!categoriaSeleccionada) {
      setSubcategoriasDisponibles([]);
      return;
    }
    const obtenerSubcategorias = async () => {
      try {
        const res = await api.get(`/subcategorias/categoria/${categoriaSeleccionada}`);
        setSubcategoriasDisponibles(res.data || []);
      } catch (error) {
        setSubcategoriasDisponibles([]);
      }
    };
    obtenerSubcategorias();
  }, [categoriaSeleccionada]);

  const cargarCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setListaCategorias(res.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const handleFileChange = (e) => {
    setModalError('');
    const files = Array.from(e.target.files);
    
    if (evidencias.length + files.length > 2) {
      setModalError('No puedes subir más de 2 evidencias en total.');
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
      return;
    }

    const archivosValidos = [];
    const nuevasPreviews = [];

    const MAX_FILE_SIZE = 10 * 1024 * 1024; 

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setModalError(`El archivo "${file.name}" supera el límite de peso permitido (10MB).`);
        if (inputArchivoRef.current) inputArchivoRef.current.value = '';
        return; 
      }
      archivosValidos.push(file);
    }

    setEvidencias(prev => [...prev, ...archivosValidos]);

    archivosValidos.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewsEvidencias(prev => [...prev, {
          url: file.type.startsWith('image/') ? reader.result : null,
          tipo: file.type,
          nombre: file.name
        }]);
      };
      if (file.type.startsWith('image/')) { 
        reader.readAsDataURL(file); 
      } else { 
        reader.onloadend(); 
      }
    });

    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  };

  const handleEliminarEvidencia = (index) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
    setPreviewsEvidencias(prev => prev.filter((_, i) => i !== index));
    setModalError(''); 
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
      const formData = new FormData();
      
      const solicitudData = {
        descripcion: formSolicitud.descripcion.trim(),
        ubicacionExacta: formSolicitud.ubicacion.trim(),
        fechaHallazgo: new Date().toISOString().split('T')[0], 
        activo: true,
        obra: { id: obra.id },
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

      const response = await api.post('/solicitudes', formData);
      setMensajeExito('Solicitud creada con éxito.');
      
      if (onSolicitudCreada) {
        onSolicitudCreada(obra.id, response.data);
      }

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Error al crear la solicitud. Intente nuevamente.';
        setModalError(msg);
      }
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  if (!show || !obra) return null;

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '550px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', color: '#333' };
  const inputStyle = { width: '100%', padding: '8px', margin: '8px 0 15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' };
  const btnStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ marginBottom: '20px', color: '#0d3b66', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
          Nueva Solicitud - {obra.nombre}
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
            style={{ ...inputStyle, height: '80px', resize: 'vertical', marginBottom: '15px' }} 
          />

          {/* NUEVO LABEL DE RESTRICCIÓN SOLICITADO */}
          <div style={{ color: '#666', fontSize: '12px', fontStyle: 'italic', marginBottom: '15px', backgroundColor: '#eef1f6', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #0d3b66' }}>
            ℹ️ Máximo 2 evidencias y cuyo peso individual no sobrepase los 10MB
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px dashed #ccc', marginTop: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Evidencia Visual (Opcional):</label>
              {/* Deshabilitar botón si ya hay 2 elementos */}
              <button 
                type="button" 
                onClick={() => inputArchivoRef.current.click()} 
                disabled={evidencias.length >= 2}
                style={{ 
                  ...btnStyle, 
                  backgroundColor: evidencias.length >= 2 ? '#e9ecef' : '#e9ecef', 
                  color: evidencias.length >= 2 ? '#999' : '#0d3b66', 
                  padding: '4px 10px', 
                  fontSize: '12px', 
                  border: '1px solid #ced4da',
                  cursor: evidencias.length >= 2 ? 'not-allowed' : 'pointer'
                }}
              >
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
            <button type="button" style={{ ...btnStyle, backgroundColor: '#ccc', color: '#333' }} onClick={onClose} disabled={modalLoading}>Cancelar</button>
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#0d3b66', color: '#fff' }} disabled={modalLoading}>
              {modalLoading ? 'Guardando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearSolicitud;