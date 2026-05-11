import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.layoutContainer}>
      <Header showLogout={true} />
      <div className={styles.mainArea}>
        <Sidebar />
        <main className={styles.contentWrapper}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;