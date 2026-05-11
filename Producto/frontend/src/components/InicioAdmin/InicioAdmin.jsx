import React from 'react';
import styles from './InicioAdmin.module.css';

const InicioAdmin = () => {
  return (
    <div className={styles.inicioContainer}>
      <h1 className={styles.title}>Inicio</h1>
      <div className={styles.contentBox}></div>
    </div>
  );
};

export default InicioAdmin;