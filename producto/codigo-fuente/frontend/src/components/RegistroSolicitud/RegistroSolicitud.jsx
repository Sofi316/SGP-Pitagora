import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../../supabaseClient';
import styles from './RegistroSolicitud.module.css';

const RegistroSolicitud = () => {
  const { id } = useParams(); // ID de la Obra desde la URL
  const navigate = useNavigate();

  // --- ESTADOS DE DATOS ---
  const [nombreObra, setNombreObra] = useState('Cargando...');
  const [listaCategorias, setListaCategorias] = useState([]);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // --- ESTADO DEL FORMULARIO ---
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

  // 1. CARGA INICIAL: Obra y Categorías
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
        setNombreObra("Obra no encontrada");
        console.error("Error al cargar datos iniciales:", error);
      }
    };
    if (id) cargarDatosIniciales();
  }, [id]);

  // 2. CARGA DINÁMICA: Subcategorías
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

  // Manejo de selección de archivos (Imagen/PDF)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidencias(prevFiles => [...prevFiles, ...files]);

    files.forEach(file => {
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
  };

  const handleEliminarEvidencia = (index) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
    setPreviewsEvidencias(prev => prev.filter((_, i) => i !== index));
  };

  // --- PROCESO DE GUARDADO CON LOGS DE DIAGNÓSTICO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const token = localStorage.getItem('token');
    console.log("Diagnóstico - Token en localStorage:", token);
    
    if (!token) {
        setMensaje({ tipo: 'error', texto: 'Sesión no encontrada. Por favor inicie sesión.' });
        setLoading(false);
        return;
    }

    try {
      // --- PASO 1: CREAR SOLICITUD EN JAVA ---
      console.log("1. Intentando guardar Solicitud en Java...");
      const solicitudData = {
        descripcion: datosFormulario.descripcion,
        ubicacionExacta: datosFormulario.ubicacion,
        fechaHallazgo: new Date().toISOString().split('T')[0], 
        activo: true,
        obra: { id: parseInt(id) },
        usuario: { id: 1 }, // ID del Admin
        estadoSolicitud: { id: 1 }, // 1 = Pendiente
        subCategoria: { id: parseInt(datosFormulario.idSubcategoria) }
      };

      const resSolicitud = await axios.post('http://localhost:8080/api/solicitudes', solicitudData, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
      });
      
      const solicitudCreada = resSolicitud.data;
      console.log("¡PASO 1 EXITOSO! Solicitud guardada con ID:", solicitudCreada.id);

      // --- PASO 2: SUBIR A SUPABASE STORAGE ---
      if (evidencias.length > 0) {
        for (const file of evidencias) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
          
          console.log("2. Intentando subir archivo a Supabase Storage:", fileName);
          const { error: uploadError } = await supabase.storage
            .from('archivo_evidencia')
            .upload(fileName, file);

          if (uploadError) {
            console.error("¡FALLO EN PASO 2 (Supabase Storage)!", uploadError);
            throw new Error(`Supabase bloqueó la subida. Detalle: ${uploadError.message}`);
          }
          console.log("¡PASO 2 EXITOSO! Archivo subido a Supabase.");

          const { data: urlData } = supabase.storage.from('archivo_evidencia').getPublicUrl(fileName);
          
          // --- PASO 3: GUARDAR LINK EN JAVA ---
          const evidenciaData = {
            rutaArchivo: urlData.publicUrl,
            tipoEvidencia: { id: file.type === 'application/pdf' ? 2 : 1 },
            solicitud: { id: solicitudCreada.id }
          };

          console.log("3. Intentando guardar el link de evidencia en Java...", evidenciaData);
          await axios.post('http://localhost:8080/api/archivos-evidencia', evidenciaData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
          });
          console.log("¡PASO 3 EXITOSO! Link de evidencia guardado en Java.");
        }
      }

      setMensaje({ tipo: 'exito', texto: '¡Solicitud registrada con éxito!' });
      setTimeout(() => navigate(-1), 1500);

    } catch (error) {
      console.error("=== ERROR DETECTADO EN EL PROCESO ===", error);
      const msg = error.response?.data?.message || error.message || "Error desconocido";
      setMensaje({ tipo: 'error', texto: `Error: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contenedorPrincipal}>
      <div className={styles.cabeceraProyecto}>
        <div className={styles.tituloContainer}>
          <button type="button" className={styles.btnVolver} onClick={handleVolver}> &#8592; </button>
          <h2 className={styles.pageTitle}>{nombreObra}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formularioTarjeta}>
        <h3 className={styles.pageTitle} style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#333' }}>
            Nueva Solicitud de Hallazgo
        </h3>

        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Categoría</label>
            <select className={styles.selectInput} value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} required>
              <option value="">Seleccione categoría</option>
              {listaCategorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>

          <div className={styles.grupoInput}>
            <label>Subcategoría</label>
            <select 
              className={styles.selectInput} 
              name="idSubcategoria" 
              value={datosFormulario.idSubcategoria} 
              onChange={(e) => setDatosFormulario({...datosFormulario, idSubcategoria: e.target.value})} 
              disabled={!categoriaSeleccionada || subcategoriasDisponibles.length === 0} 
              required
            >
              <option value="">{categoriaSeleccionada ? "Seleccione subcategoría" : "Elija categoría primero"}</option>
              {subcategoriasDisponibles.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.filaFormulario}>
          <div className={styles.grupoInput}>
            <label>Descripción detallada</label>
            <textarea 
              name="descripcion" 
              value={datosFormulario.descripcion} 
              onChange={(e) => setDatosFormulario({...datosFormulario, descripcion: e.target.value})} 
              placeholder="Describa el problema encontrado..." 
              required 
              style={{ height: '100px' }} 
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
              onChange={(e) => setDatosFormulario({...datosFormulario, ubicacion: e.target.value})} 
              placeholder="Ej: Piso 3, sector oriente, baño 2..." 
              required 
            />
          </div>
        </div>

        <div className={styles.seccionEvidencias}>
          <div className={styles.headerEvidencias}>
            <p className={styles.labelEvidencias}>Evidencia (Imágenes / PDF)</p>
            <span className={styles.linkAgregarEvidencia} onClick={() => inputArchivoRef.current.click()}>+ Adjuntar archivo</span>
          </div>
          
          <input type="file" multiple hidden accept="image/*,.pdf" onChange={handleFileChange} ref={inputArchivoRef} />

          <div className={styles.gridEvidencias}>
            {previewsEvidencias.map((item, i) => (
              <div key={i} className={styles.tarjetaEvidencia}>
                {item.tipo === 'application/pdf' ? (
                  <div className={styles.pdfPlaceholder}>
                    <span style={{ fontSize: '28px' }}>📄</span>
                    <p style={{ fontSize: '10px', marginTop: '5px' }}>{item.nombre.substring(0, 10)}</p>
                  </div>
                ) : (
                  <img src={item.url} alt="Preview" />
                )}
                <button type="button" className={styles.botonEliminarEvidencia} onClick={() => handleEliminarEvidencia(i)}>X</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contenedorMensajes}>
           {mensaje && <div className={mensaje.tipo === 'exito' ? styles.msgExito : styles.msgError}>{mensaje.texto}</div>}
        </div>

        <button type="submit" disabled={loading} className={styles.btnGuardar}>
          {loading ? 'Guardando...' : 'Finalizar Registro'}
        </button>
      </form>
    </div>
  );
};

export default RegistroSolicitud;