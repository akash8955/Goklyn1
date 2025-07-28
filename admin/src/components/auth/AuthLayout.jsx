import React from 'react';
import styles from '../../pages/LoginPage.module.css';

const AuthLayout = ({ title, children }) => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
