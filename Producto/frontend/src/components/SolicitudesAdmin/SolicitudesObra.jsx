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

  const [buscarIdPorObra, setBuscarIdPorObra] = useState({});
  const [ordenIdPorObra, setOrdenIdPorObra] = useState({});
  const [filtroEstadoPorObra, setFiltroEstadoPorObra] = useState({});

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
                          <span className={styles.colMonto} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Costo
                          </span>
                        </div>

                        {solicitudesProcesadas.map((solicitud) => (
                          <Link key={`sol-${solicitud.id}`} to={`/admin/solicitudes/${solicitud.id}`} className={styles.solicitudRowLink}>
                            <span className={styles.colId}>{solicitud.id}</span>
                            <span className={styles.colObs}>{solicitud.descripcion || 'Sin observación'}</span>
                            
                            <span className={styles.colEstado} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <span style={{ color: getColorPorEstado(solicitud.estadoSolicitud?.nombre), fontWeight: 'bold', textAlign: 'center' }}>
                                {solicitud.estadoSolicitud?.nombre || 'Pendiente'}
                              </span>
                            </span>

                            <span className={styles.colMonto} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#ffffff' }}>
                              {solicitud.costoReparacion > 0 
                                ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(solicitud.costoReparacion)
                                : '-'}
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