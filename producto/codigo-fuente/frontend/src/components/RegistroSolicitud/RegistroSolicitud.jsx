import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './RegistroSolicitud.module.css';

const RegistroSolicitud = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // --- ESTADOS PARA DATOS DINÁMICOS DE BD ---
  const [nombreObra, setNombreObra] = useState('Cargando...');
  const [listaCategorias, setListaCategorias] = useState([]);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // --- ESTADOS DEL FORMULARIO (Sin Observación) ---
  const [datosFormulario, setDatosFormulario] = useState({
    descripcion: '',
    ubicacion: '',
    idSubcategoria: '' 
  });

  const [evidencias, setEvidencias] = useState([]);
  const [previewsEvidencias, setPreviewsEvidencias] = useState([]);
  const inputArchivoRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleVolver = () => navigate(-1);

  // 1. CARGA INICIAL: Nombre de la Obra y Categorías
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const resObra = await axios.get(`http://localhost:8080/api/obras/${id}`, config);
        setNombreObra(resObra.data.nombre);

        const resCat = await axios.get('http://localhost:8080/api/categorias', config);
        setListaCategorias(resCat.data);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error.response || error);
        setNombreObra("Obra no encontrada");
      }
    };
    
    if (id) cargarDatosIniciales();
  }, [id]);

  // 2. CARGA DEPENDIENTE: Subcategorías
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

  const handleCategoriaChange = (e) => {
    setCategoriaSeleccionada(e.target.value);
    setDatosFormulario({ ...datosFormulario, idSubcategoria: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosFormulario({ ...datosFormulario, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidencias(prevFiles => [...prevFiles, ...files]);
    
    files.filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewsEvidencias(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleEliminarEvidencia = (index) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
    setPreviewsEvidencias(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const formData = new FormData();
    
    const solicitudData = {
      descripcion: datosFormulario.descripcion,
      ubicacionExacta: datosFormulario.ubicacion,
      fechaHallazgo: new Date().toISOString().split('T')[0],
      activo: true,
      obra: { id: parseInt(id) },
      usuario: { id: 1 }, 
      estadoSolicitud: { id: 1 }, 
      subCategoria: { id: parseInt(datosFormulario.idSubcategoria) }
    };

    formData.append('solicitud', new Blob([JSON.stringify(solicitudData)], { 
      type: 'application/json' 
    }));

    evidencias.forEach((file) => formData.append('archivos', file));

    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch('http://localhost:8080/api/tickets/crear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: '¡Solicitud registrada correctamente!' });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al registrar. Verifique los datos.' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contenedorPrincipal}>
      <div className={styles.cabeceraProyecto}>
        <div className={styles.tituloContainer}>
          <button type="button" className={styles.btnVolver} onClick={handleVolver}>
            &#8592;
          </button>
          <h2 className={styles.pageTitle}>{nombreObra}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formularioTarjeta}>
        <h3 className={styles.pageTitle} style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#333' }}>
            Registrar nueva solicitud
        </h3>

        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Categoría</label>
            <select 
              className={styles.selectInput} 
              value={categoriaSeleccionada} 
              onChange={handleCategoriaChange} 
              required
            >
              <option value="">Seleccione categoría</option>
              {listaCategorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.grupoInput}>
            <label>Subcategoría</label>
            <select 
              className={styles.selectInput} 
              name="idSubcategoria" 
              value={datosFormulario.idSubcategoria} 
              onChange={handleInputChange} 
              disabled={!categoriaSeleccionada || subcategoriasDisponibles.length === 0} 
              required
            >
              <option value="">
                {categoriaSeleccionada ? "Seleccione subcategoría" : "Primero elija categoría"}
              </option>
              {subcategoriasDisponibles.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ahora Descripción y Ubicación ocupan más espacio visual al no estar Observación */}
        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Descripción del hallazgo</label>
            <textarea 
              name="descripcion" 
              value={datosFormulario.descripcion} 
              onChange={handleInputChange} 
              placeholder="Describa detalladamente el problema encontrado..." 
              required 
              style={{ height: '120px' }}
            />
          </div>
        </div>

        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Ubicación exacta</label>
            <input 
              type="text"
              name="ubicacion" 
              value={datosFormulario.ubicacion} 
              onChange={handleInputChange} 
              placeholder="Ej: Piso 2, oficina 204, sector ventana norte" 
              required 
            />
          </div>
        </div>

        <div className={styles.seccionEvidencias}>
          <div className={styles.headerEvidencias}>
            <p className={styles.labelEvidencias}>Evidencia</p>
            <span className={styles.linkAgregarEvidencia} onClick={() => inputArchivoRef.current.click()}>
              + Agregar evidencia
            </span>
          </div>
          <input type="file" multiple hidden accept="image/*" onChange={handleFileChange} ref={inputArchivoRef} />
          <div className={styles.gridEvidencias}>
            {previewsEvidencias.map((src, i) => (
              <div key={i} className={styles.tarjetaEvidencia}>
                <img src={src} alt="Preview" />
                <button type="button" className={styles.botonEliminarEvidencia} onClick={() => handleEliminarEvidencia(i)}>X</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contenedorMensajes}>
          {mensaje && <div className={mensaje.tipo === 'exito' ? styles.msgExito : styles.msgError}>{mensaje.texto}</div>}
        </div>

        <button type="submit" disabled={loading} className={styles.btnGuardar}>
          {loading ? 'Guardando...' : 'Registrar Solicitud'}
        </button>
      </form>
    </div>
  );
};

export default RegistroSolicitud;