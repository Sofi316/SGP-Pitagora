import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom'; 
import api from '../../services/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import styles from './AdminDashboard.module.css';

const COLORES = {
  'Pendiente': '#f17329',
  'En Proceso': '#dfbb1d',
  'No aplica': '#858484',
  'Terminado': '#143c5e',
  'Aprobado': '#4caf50',
  'Rechazado': '#f44336'
};

const ESTADOS = Object.keys(COLORES);

const CustomTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <text x={x} y={y + 15} textAnchor="middle" fill="#333333" fontSize={11}>
      {words.map((word, index) => (
        <tspan x={x} dy={index === 0 ? 0 : 14} key={index}>
          {word}
        </tspan>
      ))}
    </text>
  );
};

export default function Dashboard() {
  const [dataReal, setDataReal] = useState([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroObra, setFiltroObra] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarPorcentaje, setMostrarPorcentaje] = useState(false);
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await api.get('/solicitudes');
        const data = respuesta.data;
        
        const datosMapeados = data.map(item => ({
          id: item.id,
          empresa: item.obra?.empresaCliente?.razonSocial || 'Sin Empresa',
          obra: item.obra?.nombre || 'Sin Obra',
          estado: item.estadoSolicitud?.nombre || 'Pendiente',
          fecha: item.fechaIngreso ? item.fechaIngreso.split('T')[0] : '',
          categoria: item.subCategoria?.categoria?.nombre || 'Sin Categoría',
          subCategoria: item.subCategoria?.nombre || 'Sin Subcategoría'
        }));

        setDataReal(datosMapeados);
      } catch (error) {
        console.error(error);
      }
    };

    obtenerDatos();
  }, []);

  const empresasUnicas = [...new Set(dataReal.map(item => item.empresa))];
  const obrasUnicas = [...new Set(dataReal.filter(item => filtroEmpresa === '' || item.empresa === filtroEmpresa).map(item => item.obra))];
  
  const categoriasUnicas = [...new Set(dataReal.map(item => item.categoria))];

  const dataFiltrada = useMemo(() => {
    return dataReal.filter(item => {
      const matchEmpresa = filtroEmpresa === '' || item.empresa === filtroEmpresa;
      const matchObra = filtroObra === '' || item.obra === filtroObra;
      const matchFechaInicio = fechaInicio === '' || (item.fecha && new Date(item.fecha) >= new Date(fechaInicio));
      const matchFechaFin = fechaFin === '' || (item.fecha && new Date(item.fecha) <= new Date(fechaFin));
      const matchCategoria = categoriaSeleccionada === 'TODAS' || item.categoria === categoriaSeleccionada;
      
      return matchEmpresa && matchObra && matchFechaInicio && matchFechaFin && matchCategoria;
    });
  }, [dataReal, filtroEmpresa, filtroObra, fechaInicio, fechaFin, categoriaSeleccionada]);

  const kpiTotales = dataFiltrada.length;
  const kpiPendientes = dataFiltrada.filter(item => item.estado === 'Pendiente').length;
  const kpiAprobados = dataFiltrada.filter(item => item.estado === 'Aprobado').length;
  
  const displayPendientes = mostrarPorcentaje && kpiTotales > 0 
    ? ((kpiPendientes / kpiTotales) * 100).toFixed(1) + '%' 
    : kpiPendientes;
    
  const displayAprobados = mostrarPorcentaje && kpiTotales > 0 
    ? ((kpiAprobados / kpiTotales) * 100).toFixed(1) + '%' 
    : kpiAprobados;

  const dataTorta = useMemo(() => {
    const conteo = {};
    ESTADOS.forEach(estado => conteo[estado] = 0);
    
    dataFiltrada.forEach(item => {
      if (conteo[item.estado] !== undefined) {
        conteo[item.estado] += 1;
      }
    });

    return Object.keys(conteo)
      .map(key => ({ name: key, value: conteo[key] }))
      .filter(item => item.value > 0);
  }, [dataFiltrada]);

  const dataBarras = useMemo(() => {
    const agrupadoPorObra = {};
    
    dataFiltrada.forEach(item => {
      if (!agrupadoPorObra[item.obra]) {
        agrupadoPorObra[item.obra] = { obra: item.obra };
        ESTADOS.forEach(estado => agrupadoPorObra[item.obra][estado] = 0);
      }
      if (agrupadoPorObra[item.obra][item.estado] !== undefined) {
        agrupadoPorObra[item.obra][item.estado] += 1;
      }
    });

    return Object.values(agrupadoPorObra);
  }, [dataFiltrada]);

  const dataFallas = useMemo(() => {
    const agrupado = {};
    
    dataFiltrada.forEach(item => {
      if (categoriaSeleccionada === 'TODAS') {
        const key = item.categoria;
        if (!agrupado[key]) agrupado[key] = { nombre: key, cantidad: 0 };
        agrupado[key].cantidad += 1;
      } else {
        const key = item.subCategoria;
        if (!agrupado[key]) agrupado[key] = { nombre: key, cantidad: 0 };
        agrupado[key].cantidad += 1;
      }
    });

    return Object.values(agrupado).sort((a, b) => b.cantidad - a.cantidad);
  }, [dataFiltrada, categoriaSeleccionada]);

  const descargarExcel = async () => {
    try {
      const idsAExportar = dataFiltrada.map(item => item.id);
      const respuesta = await api.post('/solicitudes/exportar/excel', idsAExportar, {
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([respuesta.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_observaciones.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const descargarPdf = async () => {
    try {
      const idsAExportar = dataFiltrada.map(item => item.id);
      const respuesta = await api.post('/solicitudes/exportar/pdf', idsAExportar, {
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([respuesta.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_observaciones.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Dashboard de Observaciones</h1>
        <div className={styles.headerActions}>
          <label className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              checked={mostrarPorcentaje} 
              onChange={(e) => setMostrarPorcentaje(e.target.checked)} 
            />
            Ver en porcentajes
          </label>
          <button className={styles.exportBtn} onClick={descargarExcel} disabled={dataFiltrada.length === 0}>
            <FaFileExcel size={16} />
            <span>Exportar Excel</span>
          </button>
          <button className={styles.exportPdfBtn} onClick={descargarPdf} disabled={dataFiltrada.length === 0}>
            <FaFilePdf size={16} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <div className={styles.menuBox}>
        <div className={styles.formGroup}>
          <label className={styles.selectLabel}>Empresa</label>
          <select className={styles.menuItem} value={filtroEmpresa} onChange={(e) => { setFiltroEmpresa(e.target.value); setFiltroObra(''); }}>
            <option value="">Todas las Empresas</option>
            {empresasUnicas.map(empresa => (
              <option key={empresa} value={empresa}>{empresa}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.selectLabel}>Obra</label>
          <select className={styles.menuItem} value={filtroObra} onChange={(e) => setFiltroObra(e.target.value)}>
            <option value="">Todas las Obras</option>
            {obrasUnicas.map(obra => (
              <option key={obra} value={obra}>{obra}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.selectLabel}>Fecha Inicio</label>
          <input type="date" className={styles.menuItem} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.selectLabel}>Fecha Fin</label>
          <input type="date" className={styles.menuItem} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
      </div>

      <div className={styles.kpiRow}>
        <div className={`${styles.kpiCard} ${styles.kpiTotal}`}>
          <span className={styles.kpiTitle}>Total Solicitudes</span>
          <p className={styles.kpiValue}>{kpiTotales}</p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiPendiente}`}>
          <span className={styles.kpiTitle}>Pendientes</span>
          <p className={styles.kpiValue}>{displayPendientes}</p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiAprobado}`}>
          <span className={styles.kpiTitle}>Aprobados</span>
          <p className={styles.kpiValue}>{displayAprobados}</p>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={`${styles.chartCard} ${styles.chartCardPie}`}>
          <h3 className={styles.chartTitle}>Resumen General por Estado</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <Pie
                  data={dataTorta}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius="55%" 
                  paddingAngle={0}
                  dataKey="value"
                  labelLine={true}
                  label={({ x, y, name, percent, value, cx }) => (
                    <text x={x} y={y} fill="#333333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                      <tspan x={x} dy="-0.4em">{name}</tspan>
                      <tspan x={x} dy="1.2em" fill={COLORES[name]} fontWeight="bold">
                        {mostrarPorcentaje ? `${(percent * 100).toFixed(1)}%` : value}
                      </tspan>
                    </text>
                  )}
                >
                  {dataTorta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => {
                    if (mostrarPorcentaje && kpiTotales > 0) {
                      const porcentaje = ((value / kpiTotales) * 100).toFixed(1) + '%';
                      return [porcentaje, name];
                    }
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', color: '#333333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.chartCard} ${styles.chartCardBar}`}>
          <h3 className={styles.chartTitle}>Distribución de Estados por Obra</h3>
          <div className={styles.scrollableWrapper}>
            <div className={styles.minWidthChart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBarras} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="obra" tick={<CustomTick />} interval={0} height={60} />
                  <YAxis tick={{ fill: '#333333' }} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} />
                  <Legend wrapperStyle={{ paddingTop: '15px', color: '#333333' }} />
                  {ESTADOS.map(estado => (
                    <Bar key={estado} dataKey={estado} stackId="a" fill={COLORES[estado]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={`${styles.chartCard} ${styles.chartCardBar}`} style={{ flex: '1 1 100%' }}>
          
          <div className={styles.chartHeaderFlex}>
            <h3 className={styles.chartTitle} style={{ margin: 0 }}>Volumen de Fallas por Categoría</h3>
            <div style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <select 
                className={styles.menuItem} 
                style={{ backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc' }}
                value={categoriaSeleccionada} 
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              >
                <option value="TODAS">Vista General (Por Categorías)</option>
                <optgroup label="Desglosar Subcategorías:">
                  {categoriasUnicas.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className={styles.scrollableWrapper}>
            {dataFallas.length > 0 ? (
              <div className={styles.minWidthChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataFallas} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="nombre" tick={<CustomTick />} interval={0} height={80} />
                    <YAxis tick={{ fill: '#333333' }} />
                    <Tooltip cursor={{ fill: '#f5f5f5' }} />
                    <Bar 
                      dataKey="cantidad" 
                      fill={categoriaSeleccionada === 'TODAS' ? '#0d3b66' : '#17a2b8'} 
                      name="Cantidad de Solicitudes" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={styles.emptyState}>
                No hay solicitudes asociadas a esta categoría con los filtros actuales.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}