import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo_pitagora.png';

const Header = ({ showLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className={styles.pitagoraHeader}>
      <div className={styles.headerLogoContainer}>
        <img src={logo} alt="Logo Constructora Pitágora" className={styles.headerLogo} />
      </div>
      {showLogout && (
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      )}
    </header>
  );
};

export default Header;