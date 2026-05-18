import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './ArchivadosAdmin.module.css';

const ArchivadosAdmin = () => {
  const [obras, setObras] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [comunicaciones, setComunicaciones] = useState([]);
  
  const [selectedObraId, setSelectedObraId] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  
  const [filtros, setFiltros] = useState({ fechaInicio: '', fechaFin: '', keyword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarObras();
  }, []);

  const cargarObras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/obras', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setObras(response.data);
    } catch (err) {
      setError('Error al cargar las obras.');
    }
  };

  const handleObraChange = async (e) => {
    const obraId = e.target.value;
    setSelectedObraId(obraId);
    setSelectedSolicitud(null);
    setComunicaciones([]);
    setSolicitudesFiltradas([]);

    if (!obraId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtradas = response.data.filter(s => s.obra?.id === parseInt(obraId));
      setSolicitudesFiltradas(filtradas);
    } catch (err) {
      setError('Error al cargar las solicitudes de esta obra.');
    }
  };

  const handleSolicitudChange = (e) => {
    const solicitudId = e.target.value;
    if (!solicitudId) {
      setSelectedSolicitud(null);
      setComunicaciones([]);
      return;
    }
    const solicitud = solicitudesFiltradas.find(s => s.id === parseInt(solicitudId));
    setSelectedSolicitud(solicitud);
    cargarComunicaciones(solicitudId, filtros.fechaInicio, filtros.fechaFin, filtros.keyword);
  };

  const cargarComunicaciones = async (idSolicitud, inicio, fin, keyword) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('id', idSolicitud);
      if (inicio) params.append('fechaInicio', inicio);
      if (fin) params.append('fechaFin', fin);
      if (keyword) params.append('keyword', keyword);

      const response = await axios.get(`http://localhost:8080/api/comunicaciones/filtrar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComunicaciones(response.data);
    } catch (err) {
      setError('Error al cargar el historial de comunicaciones.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    if (selectedSolicitud) {
      cargarComunicaciones(selectedSolicitud.id, filtros.fechaInicio, filtros.fechaFin, filtros.keyword);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: '', fechaFin: '', keyword: '' });
    if (selectedSolicitud) {
      cargarComunicaciones(selectedSolicitud.id, '', '', '');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmpresaNombre = (obra) => {
    if (!obra) return '';
    return obra.empresaCliente?.razonSocial || obra.empresa?.razonSocial || '';
  };

  const getEstadoNombre = (sol) => {
    if (!sol) return '';
    return sol.estadoSolicitud?.nombre || sol.estado?.nombre || '';
  };

  const getUsuarioNombre = (sol) => {
    if (!sol || !sol.usuario) return 'No registrado';
    return `${sol.usuario.nombre} ${sol.usuario.apellido}`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Archivo de Comunicaciones</h1>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.menuBox}>
        <div>
          <label className={styles.selectLabel}>Seleccionar Obra</label>
          <select 
            className={styles.menuItem}
            onChange={handleObraChange}
            value={selectedObraId}
          >
            <option value="">-- Seleccione una Obra --</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre} {getEmpresaNombre(obra) ? `- Empresa: ${getEmpresaNombre(obra)}` : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedObraId && (
          <div>
            <label className={styles.selectLabel}>Seleccionar Solicitud</label>
            <select 
              className={styles.menuItem}
              onChange={handleSolicitudChange}
              value={selectedSolicitud?.id || ''}
            >
              <option value="">-- Seleccione la Solicitud --</option>
              {solicitudesFiltradas.map(sol => (
                <option key={sol.id} value={sol.id}>
                  ID: {sol.id} - {sol.descripcion?.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSolicitud && (
          <div className={styles.detailsGrid}>
            <p><strong>ID Solicitud:</strong> {selectedSolicitud.id}</p>
            <p><strong>Estado Actual:</strong> {getEstadoNombre(selectedSolicitud)}</p>
            <p><strong>Empresa:</strong> {getEmpresaNombre(selectedSolicitud.obra)}</p>
            <p><strong>Solicitante:</strong> {getUsuarioNombre(selectedSolicitud)}</p>
            <p><strong>Fecha Creación:</strong> {formatDate(selectedSolicitud.fechaIngreso)}</p>
            <p className={styles.fullWidth}><strong>Observación:</strong> {selectedSolicitud.descripcion}</p>
          </div>
        )}
      </div>

      {selectedSolicitud && (
        <>
          <div className={styles.menuBox}>
            <form onSubmit={aplicarFiltros} className={styles.filtersForm}>
              <div className={styles.formGroup}>
                <label className={styles.selectLabel}>Desde</label>
                <input 
                  type="date" 
                  value={filtros.fechaInicio} 
                  onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                  className={styles.menuItem}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.selectLabel}>Hasta</label>
                <input 
                  type="date" 
                  value={filtros.fechaFin} 
                  onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                  className={styles.menuItem}
                />
              </div>
              <div className={styles.formGroupLarge}>
                <label className={styles.selectLabel}>Búsqueda por texto</label>
                <input 
                  type="text" 
                  placeholder="Asunto, mensaje o remitente..."
                  value={filtros.keyword} 
                  onChange={(e) => setFiltros({...filtros, keyword: e.target.value})}
                  className={styles.menuItem}
                />
              </div>
              <div className={styles.btnGroup}>
                <button type="submit" className={styles.btnPrimary}>Filtrar</button>
                <button type="button" onClick={limpiarFiltros} className={styles.btnSecondary}>Limpiar</button>
              </div>
            </form>
          </div>

          <div className={styles.comList}>
            {loading ? (
              <div className={styles.menuBox}>
                <p style={{ color: '#ffffff', margin: 0 }}>Sincronizando con el archivo...</p>
              </div>
            ) : comunicaciones.length === 0 ? (
              <div className={styles.menuBox}>
                <p style={{ color: '#ffffff', margin: 0 }}>No hay registros de comunicación para los criterios seleccionados.</p>
              </div>
            ) : (
              comunicaciones.map((com) => (
                <div key={com.id} className={styles.correoBox}>
                  <div className={styles.comHeader}>
                    <h5 className={styles.comSubject}>{com.asunto}</h5>
                    <span className={styles.comDate}>{formatDate(com.fechaEnvio)}</span>
                  </div>
                  <div>
                    <div className={styles.comMeta}>
                      <p><strong>De:</strong> {com.remitente}</p>
                      <p><strong>Para:</strong> {com.destinatario}</p>
                    </div>
                    <div className={styles.comText}>{com.cuerpoMensaje}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ArchivadosAdmin;