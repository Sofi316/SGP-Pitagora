import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './ClientSolicitudes.module.css';

const ClientSolicitudes = () => {
  const [usuario, setUsuario] = useState(null);
  const [solicitudesPorObra, setSolicitudesPorObra] = useState({});
  const [obrasExpandidas, setObrasExpandidas] = useState([]);
  const [loadingObraId, setLoadingObraId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [buscarIdPorObra, setBuscarIdPorObra] = useState({});
  const [ordenIdPorObra, setOrdenIdPorObra] = useState({});
  const [filtroEstadoPorObra, setFiltroEstadoPorObra] = useState({});

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
    if (est.includes('pendiente')) return '#ffa600'; 
    if (est.includes('proceso')) return '#e6e22e';   
    if (est.includes('terminado')) return '#143c5e'; 
    if (est.includes('no aplica')) return '#494848'; 
    if (est.includes('aprobado') || est.includes('aceptado')) return '#4caf50';  
    if (est.includes('rechazado')) return '#f44336'; 
    return '#ffffff';
  };

  const obtenerSolicitudesFiltradasYOrdenadas = (obraId) => {
    const solicitudesRaw = solicitudesPorObra[obraId];
    if (!solicitudesRaw) return [];

    let resultado = [...solicitudesRaw];

    const bId = buscarIdPorObra[obraId] || '';
    const fEstado = filtroEstadoPorObra[obraId] || '';
    const oId = ordenIdPorObra[obraId] || 'desc';

    if (bId.trim() !== '') {
      resultado = resultado.filter(sol => sol.id.toString().includes(bId.trim()));
    }

    if (fEstado !== '') {
      resultado = resultado.filter(sol => {
        const estadoNombre = sol.estadoSolicitud?.nombre || 'Pendiente';
        return estadoNombre.toLowerCase() === fEstado.toLowerCase();
      });
    }

    const prioridadEstados = {
      'pendiente': 1,
      'en proceso': 2,
      'proceso': 2,
      'terminado': 3,
      'aprobado': 4,
      'aceptado': 4,
      'rechazado': 5,
      'no aplica': 6
    };

    resultado.sort((a, b) => {
      const estadoA = (a.estadoSolicitud?.nombre || 'Pendiente').toLowerCase();
      const estadoB = (b.estadoSolicitud?.nombre || 'Pendiente').toLowerCase();

      const prioridadA = prioridadEstados[estadoA] || 99;
      const prioridadB = prioridadEstados[estadoB] || 99;

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      if (oId === 'asc') {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });

    return resultado;
  };

  const handleFiltroChange = (obraId, tipo, valor) => {
    if (tipo === 'buscarId') setBuscarIdPorObra(prev => ({ ...prev, [obraId]: valor }));
    if (tipo === 'ordenId') setOrdenIdPorObra(prev => ({ ...prev, [obraId]: valor }));
    if (tipo === 'filtroEstado') setFiltroEstadoPorObra(prev => ({ ...prev, [obraId]: valor }));
  };

  const limpiarFiltrosObra = (obraId) => {
    setBuscarIdPorObra(prev => ({ ...prev, [obraId]: '' }));
    setFiltroEstadoPorObra(prev => ({ ...prev, [obraId]: '' }));
    setOrdenIdPorObra(prev => ({ ...prev, [obraId]: 'desc' }));
  };

  const filterBarStyle = { display: 'flex', gap: '15px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' };
  const filterInputStyle = { padding: '5px 8px', borderRadius: '4px', border: '1px solid #ced4da', outline: 'none', backgroundColor: '#fff', color: '#333', fontSize: '13px' };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Mis Solicitudes</h1>
      </div>

      {error && <p style={{ color: '#ffcccc', marginBottom: '15px' }}>{error}</p>}

      <div className={styles.listBox}>
        {loading ? (
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ color: 'white', fontSize: '18px' }}>Cargando obras...</p>
          </div>
        ) : !usuario || !usuario.obras || usuario.obras.length === 0 ? (
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ color: 'white', fontSize: '18px' }}>No tiene obras asignadas.</p>
          </div>
        ) : (
          usuario.obras.map((obra) => {
            const isObraExpanded = obrasExpandidas.includes(obra.id);
            const solicitudesProcesadas = obtenerSolicitudesFiltradasYOrdenadas(obra.id);

            const currentBuscarId = buscarIdPorObra[obra.id] || '';
            const currentOrdenId = ordenIdPorObra[obra.id] || 'desc';
            const currentFiltroEstado = filtroEstadoPorObra[obra.id] || '';
            const tieneFiltrosActivos = currentBuscarId || currentFiltroEstado || currentOrdenId !== 'desc';

            return (
              <div key={`obra-${obra.id}`} className={styles.accordionGroup}>
                <div
                  className={`${styles.itemRow} ${styles.obraRow}`}
                  onClick={() => toggleObra(obra.id)}
                >
                  <span className={styles.itemName}>{obra.nombre}</span>
                  <span className={styles.indicator} style={{ minWidth: '20px', textAlign: 'center' }}>
                    {isObraExpanded ? '▼' : '▲'}
                  </span>
                </div>

                {isObraExpanded && (
                  <div className={styles.solicitudesWrapper}>
                    {!loadingObraId && solicitudesPorObra[obra.id] && solicitudesPorObra[obra.id].length > 0 && (
                      <div style={filterBarStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>Buscar por ID:</label>
                          <input 
                            type="number" 
                            placeholder="Ej: 7" 
                            value={currentBuscarId}
                            onChange={(e) => handleFiltroChange(obra.id, 'buscarId', e.target.value)}
                            style={{ ...filterInputStyle, width: '80px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>Orden ID:</label>
                          <select 
                            value={currentOrdenId} 
                            onChange={(e) => handleFiltroChange(obra.id, 'ordenId', e.target.value)}
                            style={filterInputStyle}
                          >
                            <option value="desc">Recientes</option>
                            <option value="asc">Antiguas</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <label style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>Filtrar Estado:</label>
                          <select 
                            value={currentFiltroEstado} 
                            onChange={(e) => handleFiltroChange(obra.id, 'filtroEstado', e.target.value)}
                            style={filterInputStyle}
                          >
                            <option value="">Todos</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="No Aplica">No Aplica</option>
                            <option value="Terminado">Terminado</option>
                            <option value="Aprobado">Aprobado / Aceptado</option>
                            <option value="Rechazado">Rechazado</option>
                          </select>
                        </div>

                        {tieneFiltrosActivos && (
                          <button 
                            onClick={() => limpiarFiltrosObra(obra.id)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#d9534f', color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', marginTop: '14px' }}
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    )}

                    {loadingObraId === obra.id ? (
                      <p className={styles.emptyText} style={{ textAlign: 'center' }}>Cargando solicitudes...</p>
                    ) : solicitudesProcesadas.length === 0 ? (
                      <p className={styles.emptyText}>
                        {tieneFiltrosActivos 
                          ? "No se encontraron solicitudes con los filtros aplicados."
                          : "No hay solicitudes para esta obra."}
                      </p>
                    ) : (
                      <>
                        <div className={styles.solicitudesHeader}>
                          <span className={styles.colId}>ID</span>
                          <span className={styles.colObs}>Observación</span>
                          <span className={styles.colEstado} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Estado
                          </span>
                        </div>

                        {solicitudesProcesadas.map((solicitud) => (
                          <Link key={`sol-${solicitud.id}`} to={`/cliente/solicitudes/${solicitud.id}`} className={styles.solicitudRowLink}>
                            <span className={styles.colId}>{solicitud.id}</span>
                            <span className={styles.colObs}>{solicitud.descripcion || 'Sin observación'}</span>
                            
                            <span className={styles.colEstado} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <span style={{ color: getColorPorEstado(solicitud.estadoSolicitud?.nombre), fontWeight: 'bold', textAlign: 'center' }}>
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
    </div>
  );
};

export default ClientSolicitudes;