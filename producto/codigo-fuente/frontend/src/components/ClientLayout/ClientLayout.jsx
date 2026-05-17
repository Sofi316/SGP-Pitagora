import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import ClientSidebar from '../ClientSidebar/ClientSidebar';
import styles from './ClientLayout.module.css';

const ClientLayout = () => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (rol !== 'CLIENTE') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className={styles.layoutContainer}>
      <Header showLogout={true} />
      <div className={styles.mainArea}>
        <ClientSidebar />
        <main className={styles.contentWrapper}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
