import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './SolicitudesAdmin.module.css';

const SolicitudesObras = () => {
  const { id } = useParams(); // ID de la Empresa
  const navigate = useNavigate();
  
  const [empresa, setEmpresa] = useState(null);
  const [obras, setObras] = useState([]);
  
  const [solicitudesPorObra, setSolicitudesPorObra] = useState({});
  const [loadingObraId, setLoadingObraId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [obrasExpandidas, setObrasExpandidas] = useState([]);

  // CORRECCIÓN: Ahora recibe el ID de la OBRA
  const irARegistroSolicitud = (obraId) => {
    navigate(`/admin/solicitudes/registro/${obraId}`);
  };
    
  useEffect(() => {
    cargarDatosBasicos();
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
        
        setSolicitudesPorObra(prev => ({
          ...prev,
          [obraId]: resSolicitudes.data
        }));
      } catch (err) {
        console.error("Error al cargar solicitudes de la obra", err);
      } finally {
        setLoadingObraId(null); 
      }
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

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={() => navigate('/admin/solicitudes')} title="Volver a Solicitudes">
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
                <div className={`${styles.itemRow} ${styles.obraRow}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }} onClick={() => toggleObra(obra.id)}>
                    <span className={styles.itemName}>{obra.nombre}</span>
                   
                  </div>

                  {/* CORRECCIÓN: Botón agregado dentro de la fila de la OBRA */}
                  <button 
                    className={styles.createClientBtn} 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se cierre el acordeón al hacer clic
                      irARegistroSolicitud(obra.id);
                    }}
                    style={{ padding: '5px 15px', fontSize: '12px' }}
                  >
                    Agregar solicitud
                  </button>
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
                          <Link 
                            key={`sol-${solicitud.id}`} 
                            to={`/admin/solicitudes/${solicitud.id}`} 
                            className={styles.solicitudRowLink}
                          >
                            <span className={styles.colId}>{solicitud.id}</span>
                            <span className={styles.colObs}>
                              {solicitud.descripcion || 'Sin observación'}
                            </span>
                            <span 
                              className={styles.colEstado} 
                              style={{ color: getColorPorEstado(solicitud.estadoSolicitud?.nombre) }}
                            >
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
    </div>
  );
};

export default SolicitudesObras;