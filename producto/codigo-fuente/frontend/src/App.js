import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import LoginPanel from './components/LoginPanel/LoginPanel';
import RecoverPassword from './components/RecoverPassword/RecoverPassword';
import AdminLayout from './components/AdminLayout/AdminLayout';
import InicioAdmin from './components/InicioAdmin/InicioAdmin';
import './index.css';

function App() {
  return (
    <Router>
       <Routes>
        <Route path="/" element={
          <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
            <Header showLogout={false}/>
            <LoginPanel />
          </div>
        }/>

        <Route path="/recuperar" element={
          <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header showLogout={false} />
            <RecoverPassword />
          </div>
        } />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<InicioAdmin />} />
          <Route path="dashboard" element={<div style={{color: 'white'}}>Dashboard</div>} />
          <Route path="solicitudes" element={<div style={{color: 'white'}}>Solicitudes</div>} />
          <Route path="archivados" element={<div style={{color: 'white'}}>Archivados</div>} />
          <Route path="gestion" element={<div style={{color: 'white'}}>Gestión</div>} />
        </Route>

        </Routes>
    </Router>
  );
}

export default App;
