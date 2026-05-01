import React from 'react';
import styles from './Header.module.css';
import logo from '../../assets/logo_pitagora.png';

const Header = () => {
  return (
    <header className={styles.pitagoraHeader}>
      <div className={styles.headerLogoContainer}>
        <img src={logo} alt="Logo Constructora Pitágora" className={styles.headerLogo} />
      </div>
    </header>
  );
};

export default Header;