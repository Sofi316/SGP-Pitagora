import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './ClientSidebar.module.css';

const ClientSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navMenu}>
        <NavLink
          to="/cliente"
          end
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginRight: '10px', verticalAlign: 'middle' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Mis Solicitudes</span>
        </NavLink>
        <NavLink
          to="/cliente/perfil"
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" style={{ marginRight: '10px', verticalAlign: 'middle' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ verticalAlign: 'middle' }}>Mi Perfil</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default ClientSidebar;
