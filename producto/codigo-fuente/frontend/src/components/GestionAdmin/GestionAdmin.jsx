import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GestionAdmin.module.css';

const GestionAdmin = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión</h1>
      <div className={styles.menuBox}>
        <Link to="/admin/gestion/empresas" className={styles.menuItem}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Clientes</span>
        </Link>
        <Link to="/admin/gestion/obras" className={styles.menuItem}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Obras</span>
        </Link>
        <Link to="/admin/gestion/usuarios" className={styles.menuItem}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Usuarios</span>
        </Link>
        <Link to="/admin/gestion/categorias" className={styles.menuItem}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Categorías</span>
        </Link>
        <Link to="/admin/gestion/subcategorias" className={styles.menuItem}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <path d="M8 10h8"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Subcategorías</span>
        </Link>
        
      </div>
    </div>
  );
};

export default GestionAdmin;