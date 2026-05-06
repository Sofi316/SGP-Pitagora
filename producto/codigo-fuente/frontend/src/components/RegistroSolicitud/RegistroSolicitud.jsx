import React, { useState, useRef } from 'react';
import styles from './RegistroSolicitud.module.css';

const RegistroSolicitud = () => {
  // 1. Estado para los campos de texto
  const [datosFormulario, setDatosFormulario] = useState({
    observacion: '',
    descripcion: '',
    ubicacion: '',
  });

  // 2. Estado para los archivos (evidencias)
  const [evidencias, setEvidencias] = useState([]);
  
  // 3. Estado para las previsualizaciones de imágenes
  const [previewsEvidencias, setPreviewsEvidencias] = useState([]);
  
  // 4. Referencia para el input de archivo oculto
  const inputArchivoRef = useRef(null);
  
  // 5. Estado para manejar la carga y mensajes
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Función para actualizar los campos de texto
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosFormulario({
      ...datosFormulario,
      [name]: value,
    });
  };

  // Función para manejar la selección de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Actualizar el estado de los archivos reales para el FormData
    setEvidencias(prevFiles => [...prevFiles, ...files]);
    
    // Generar previsualizaciones de imágenes
    const filePreviews = files.filter(file => file.type.startsWith('image/')).map(file => {
      const reader = new FileReader();
      return new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(filePreviews).then(previews => {
      setPreviewsEvidencias(prevPreviews => [...prevPreviews, ...previews]);
    });
  };
  
  // Función para eliminar una evidencia seleccionada
  const handleEliminarEvidencia = (index) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
    setPreviewsEvidencias(prev => prev.filter((_, i) => i !== index));
  };
  
  // Función para abrir el selector de archivos
  const triggerFileInput = () => {
    inputArchivoRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    // Creamos el objeto FormData
    const formData = new FormData();
    
    // Agregamos los textos
    formData.append('observacion', datosFormulario.observacion);
    formData.append('descripcion', datosFormulario.descripcion);
    formData.append('ubicacion', datosFormulario.ubicacion);

    // Agregamos los archivos (El backend debe esperar un array o lista multipart)
    evidencias.forEach((file) => {
      formData.append('archivos', file); 
    });

    try {
      // Recuperamos el token guardado
      const token = localStorage.getItem('token'); 

      // Hacemos la petición POST al backend
      const response = await fetch('http://localhost:8080/api/tickets/crear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Solicitud registrada correctamente.' });
        // Limpiar el formulario y evidencias
        setDatosFormulario({ observacion: '', descripcion: '', ubicacion: '' });
        setEvidencias([]);
        setPreviewsEvidencias([]);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al registrar la solicitud.' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contenedorPrincipal}>
      {/* Botón de volver y Título de la página */}
      <div className={styles.cabeceraProyecto}>
         <button className={styles.btnVolver}>
          ←         
          </button>
         <h2 className={styles.pageTitle}>Volver a mis solicitudes</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formularioTarjeta}>
        
        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Observación (Título)</label>
            <input 
              type="text" 
              name="observacion"
              value={datosFormulario.observacion}
              onChange={handleInputChange}
              placeholder="Escriba la observación"
              required 
            />
          </div>
          {/* El ID, Fecha y Estado no van aquí porque se generan solos al crear */}
        </div>

        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Descripción</label>
            <textarea 
              name="descripcion"
              value={datosFormulario.descripcion}
              onChange={handleInputChange}
              placeholder="Detalle el problema..."
              required 
            />
          </div>

          <div className={styles.grupoInput}>
            <label>Ubicación</label>
            <textarea 
              name="ubicacion"
              value={datosFormulario.ubicacion}
              onChange={handleInputChange}
              placeholder="Ej: Piso 2. Baño de hombres, segundo cubículo."
              required 
            />
          </div>
        </div>

        <div className={styles.seccionEvidencias}>
          <div className={styles.headerEvidencias}>
            <p className={styles.labelEvidencias}>Evidencia</p>
            <span className={styles.linkAgregarEvidencia} onClick={triggerFileInput}>
              + Agregar evidencia
            </span>
          </div>

          <input 
            type="file" 
            multiple 
            accept="image/*,.pdf" 
            onChange={handleFileChange} 
            ref={inputArchivoRef}
            className={styles.inputArchivoOculto}
          />

          <div className={styles.gridEvidencias}>
            {previewsEvidencias.map((preview, index) => (
              <div key={index} className={styles.tarjetaEvidencia}>
                <img src={preview} alt={`Previsualización ${index + 1}`} />
                <button type="button" className={styles.botonEliminarEvidencia} onClick={() => handleEliminarEvidencia(index)}>
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contenedorMensajes}>
          {mensaje && (
            <div className={mensaje.tipo === 'exito' ? styles.msgExito : styles.msgError}>
              {mensaje.texto}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className={styles.btnGuardar}>
          {loading ? 'Guardando...' : 'Registrar Solicitud'}
        </button>

      </form>
    </div>
  );
};

export default RegistroSolicitud;