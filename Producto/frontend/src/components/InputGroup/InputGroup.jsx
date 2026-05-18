import React from 'react';
import styles from './InputGroup.module.css';

const InputGroup = ({ label, type, value, onChange, placeholder, name }) => {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel} htmlFor={name}>{label}</label>
      <input
        className={styles.inputField}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputGroup;