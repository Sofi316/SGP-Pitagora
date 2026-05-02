import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navMenu}>
        <NavLink 
          to="/admin" 
          end 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          Inicio
        </NavLink>
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/admin/solicitudes" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          Solicitudes
        </NavLink>
        <NavLink 
          to="/admin/archivados" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          Archivados
        </NavLink>
        <NavLink 
          to="/admin/gestion" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          Gestion
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;