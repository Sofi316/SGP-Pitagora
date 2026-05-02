import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './SolicitudesAdmin.module.css';

const SolicitudesObras = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [empresa, setEmpresa] = useState(null);
  const [obras, setObras] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [obrasExpandidas, setObrasExpandidas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resEmpresa, resObras] = await Promise.all([
        axios.get(`http://localhost:8080/api/empresas-clientes/${id}`, config),
        axios.get(`http://localhost:8080/api/obras/empresa/${id}`, config).catch(() => ({ data: [] }))
      ]);
      
      let resSolicitudes = { data: [] };
      try {
        resSolicitudes = await axios.get('http://localhost:8080/api/solicitudes', config);
      } catch (e) {}
      
      setEmpresa(resEmpresa.data);
      setObras(resObras.data);
      setSolicitudes(resSolicitudes.data);
    } catch (err) {
      setError('Ocurrió un error al cargar los datos de la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const toggleObra = (obraId) => {
    if (obrasExpandidas.includes(obraId)) {
      setObrasExpandidas(obrasExpandidas.filter(expId => expId !== obraId));
    } else {
      setObrasExpandidas([...obrasExpandidas, obraId]);
    }
  };

  const getSolicitudesPorObra = (obraId) => {
    return solicitudes.filter(solicitud => solicitud.obra && solicitud.obra.id === obraId);
  };

  const getColorPorEstado = (nombreEstado) => {
    if (!nombreEstado) return '#ff9800'; 
    const est = nombreEstado.toLowerCase();
    if (est.includes('pendiente')) return '#ff9800'; 
    if (est.includes('proceso')) return '#ffeb3b';   
    if (est.includes('terminado')) return '#64b5f6'; 
    if (est.includes('no aplica')) return '#3a3a3a'; 
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
            const solicitudesDeObra = getSolicitudesPorObra(obra.id);

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
                    {solicitudesDeObra.length === 0 ? (
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