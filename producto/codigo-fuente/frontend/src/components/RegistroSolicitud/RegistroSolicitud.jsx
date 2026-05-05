import React, { useState } from 'react';
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
  
  // 3. Estado para manejar la carga y mensajes
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
    // Convertimos el FileList a un array para guardarlo en el estado
    const files = Array.from(e.target.files);
    setEvidencias(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    // Creamos el objeto FormData
    const formData = new FormData();
    
    // Agregamos los textos (El backend debe recibirlos con estos mismos nombres)
    formData.append('observacion', datosFormulario.observacion);
    formData.append('descripcion', datosFormulario.descripcion);
    formData.append('ubicacion', datosFormulario.ubicacion);

    // Agregamos los archivos (El backend debe esperar un array o lista multipart)
    evidencias.forEach((file) => {
      formData.append('archivos', file); 
    });

    try {
      // Recuperamos el token guardado (asumiendo que lo guardas en localStorage al hacer login)
      const token = localStorage.getItem('token'); 

      // Hacemos la petición POST al backend
      const response = await fetch('http://localhost:8080/api/tickets/crear', {
        method: 'POST',
        headers: {
          // IMPORTANTE: Cuando usas FormData, NO debes poner 'Content-Type': 'application/json'
          // El navegador configurará el 'multipart/form-data' automáticamente con sus boundaries
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: 'Solicitud registrada correctamente.' });
        // Opcional: Limpiar el formulario o redirigir al Dashboard
        setDatosFormulario({ observacion: '', descripcion: '', ubicacion: '' });
        setEvidencias([]);
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
      {/* Botón de volver y Título de la obra */}
      <div className={styles.cabeceraProyecto}>
         <button className={styles.btnVolver}>⬅</button>
         <h2>Hospital Veterinario Campus San Joaquín</h2>
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
              placeholder="Ej: WC malo"
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
              placeholder="Detalla el problema..."
              required 
            />
          </div>

          <div className={styles.grupoInput}>
            <label>Ubicación</label>
            <textarea 
              name="ubicacion"
              value={datosFormulario.ubicacion}
              onChange={handleInputChange}
              placeholder="Ej: Piso 2. Baño de hombres..."
              required 
            />
          </div>
        </div>

        <div className={styles.seccionEvidencias}>
          <label>Evidencia</label>
          <div className={styles.inputArchivoWrapper}>
            {/* El input real está oculto o estilizado para parecerse a "+ Agregar evidencia" */}
            <input 
              type="file" 
              multiple 
              accept="image/*,.pdf" 
              onChange={handleFileChange} 
              className={styles.inputArchivo}
            />
          </div>
          {/* Previsualización de nombres de archivos seleccionados */}
          {evidencias.length > 0 && (
            <ul className={styles.listaArchivos}>
              {evidencias.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {mensaje && (
          <div className={mensaje.tipo === 'exito' ? styles.msgExito : styles.msgError}>
            {mensaje.texto}
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.btnGuardar}>
          {loading ? 'Guardando...' : 'Registrar Solicitud'}
        </button>

      </form>
    </div>
  );
};

export default RegistroSolicitud;