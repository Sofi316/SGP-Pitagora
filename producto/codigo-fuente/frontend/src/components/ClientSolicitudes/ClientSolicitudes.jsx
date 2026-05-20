import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ClientSolicitudes.module.css';

const ClientSolicitudes = () => {
  const [usuario, setUsuario] = useState(null);
  const [solicitudesPorObra, setSolicitudesPorObra] = useState({});
  const [obrasExpandidas, setObrasExpandidas] = useState([]);
  const [loadingObraId, setLoadingObraId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('No se pudo identificar al usuario.');
        return;
      }

      const response = await api.get(`/usuarios/${userId}`);
      setUsuario(response.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('Ocurrió un error al cargar sus datos.');
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
        if (err.response?.status !== 401) {
          console.error(`Error en obra ${obraId}:`, err.response?.data || err.message);
          setError('No se pudieron cargar las solicitudes de esta obra.');
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
        <h1 className={styles.title}>Mis Solicitudes</h1>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Cargando obras...</p>
        ) : !usuario || !usuario.obras || usuario.obras.length === 0 ? (
          <p style={{ color: 'white' }}>No tiene obras asignadas.</p>
        ) : (
          usuario.obras.map((obra) => {
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
                          <div
                            key={`sol-${solicitud.id}`}
                            className={styles.solicitudRow}
                          >
                            <span className={styles.colId}>{solicitud.id}</span>
                            <span className={styles.colObs}>
                              {solicitud.observacion || 'Sin observación'}
                            </span>
                            <span
                              className={styles.colEstado}
                              style={{
                                backgroundColor: getColorPorEstado(solicitud.estadoSolicitud?.nombre),
                                color: '#000',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}
                            >
                              {solicitud.estadoSolicitud?.nombre || 'Sin estado'}
                            </span>
                          </div>
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

export default ClientSolicitudes;