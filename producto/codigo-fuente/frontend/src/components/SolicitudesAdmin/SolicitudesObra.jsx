import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './SolicitudesAdmin.module.css';

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

  useEffect(() => {
    cargarDatosBasicos();
  }, [id]);

  const cargarDatosBasicos = async () => {
    setLoading(true);
    setError('');
    try {      
      const [resEmpresa, resObras] = await Promise.all([
        api.get(`/empresas-clientes/${id}`),
        api.get(`/obras/empresa/${id}`).catch(() => ({ data: [] }))
      ]);
      
      setEmpresa(resEmpresa.data);
      setObras(resObras.data);
    } catch (err) {
      if(err.response?.status !== 401){
        setError('Ocurrió un error al cargar los datos de la empresa.');
      }
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
        const resSolicitudes = await api.get(`/solicitudes/obra/${obraId}`);
        
        setSolicitudesPorObra(prev => ({
          ...prev,
          [obraId]: resSolicitudes.data
        }));
      } catch (err) {
        if(err.response?.status !== 401){
          console.error(`Error en obra ${obraId}:`, err.response?.data || err.message);
          setError("No se pudieron cargar las solicitudes de esta obra.");
        }
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
        
        <div className={styles.headerButtons}>
          <button className={styles.archivarBtn}>
            Archivar Solicitud
          </button>
          <button className={styles.createClientBtn}>
            Agregar solicitud
          </button>
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
                >
                  <span className={styles.itemName}>{obra.nombre}</span>
                  <span className={styles.indicator}>
                    {isObraExpanded ? '▼' : '▼'} 
                  </span>
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