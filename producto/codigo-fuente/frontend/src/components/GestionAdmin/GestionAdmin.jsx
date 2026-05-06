import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GestionAdmin.module.css';

const GestionAdmin = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión</h1>
      <div className={styles.menuBox}>
        <Link to="/admin/gestion/categorias" className={styles.menuItem}>Categorías</Link>
        <Link to="/admin/gestion/subcategorias" className={styles.menuItem}>Subcategorías</Link>
        <Link to="/admin/gestion/empresas" className={styles.menuItem}>Clientes</Link>
        <Link to="/admin/gestion/obras" className={styles.menuItem}>Obras</Link>
      </div>
    </div>
  );
};

export default GestionAdmin;