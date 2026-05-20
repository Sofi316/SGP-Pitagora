import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './SolicitudesAdmin.module.css';
import ModalCrearSolicitud from '../Shared/ModalCrearSolicitud';

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

  // Estados mínimos necesarios para controlar el Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [obraSeleccionadaModal, setObraSeleccionadaModal] = useState(null);

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
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Ocurrió un error al cargar los datos de la empresa.';
        setError(msg);
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
    setShowCreateModal(true);
  };

  // Callback que ejecutará el Modal para actualizar la lista local al guardar con éxito
  const handleSolicitudCreada = (obraId, nuevaSolicitud) => {
    setSolicitudesPorObra(prev => {
      const solicitudesExistentes = prev[obraId] || [];
      return {
        ...prev,
        [obraId]: [nuevaSolicitud, ...solicitudesExistentes]
      };
    });
  };

  const getColorPorEstado = (nombreEstado) => {
    if (!nombreEstado) return '#ff9800'; 
    const est = nombreEstado.toLowerCase();
    if (est.includes('pendiente')) return '#ffa600'; 
    if (est.includes('proceso')) return '#e6e22e';   
    if (est.includes('terminado')) return '#143c5e'; 
    if (est.includes('no aplica')) return '#494848'; 
    if (est.includes('aprobado')) return '#4caf50';  
    if (est.includes('rechazado')) return '#f44336'; 
    return '#ffffff';
  };

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
                     Nueva Solicitud
                    </button>
                    <span className={styles.indicator} style={{ minWidth: '20px', textAlign: 'center' }}>
                      {isObraExpanded ? '▼' : '▲'} 
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
                            <span className={styles.colEstado}>
                              <span className={styles.colEstado} style={{ color: getColorPorEstado(solicitud.estadoSolicitud?.nombre), fontWeight: 'bold' }}>
                                {solicitud.estadoSolicitud?.nombre || 'Pendiente'}
                              </span>
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

      {/* Invocación limpia de nuestro nuevo componente modular */}
      <ModalCrearSolicitud 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        obra={obraSeleccionadaModal}
        onSolicitudCreada={handleSolicitudCreada}
      />
    </div>
  );
};

export default SolicitudesObras;