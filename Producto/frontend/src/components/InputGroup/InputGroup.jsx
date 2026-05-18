import React from 'react';
import styles from './InputGroup.module.css';

const InputGroup = ({ label, type, value, onChange, placeholder, name, icon }) => {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel} htmlFor={name}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            opacity: 0.5,
            zIndex: 1
          }}>
            {icon}
          </div>
        )}
        <input
          className={`${styles.inputField} ${icon ? styles.inputFieldWithIcon : ''}`}
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputGroup;