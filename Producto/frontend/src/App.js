import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import LoginPanel from './components/LoginPanel/LoginPanel';
import RecoverPassword from './components/RecoverPassword/RecoverPassword';
import AdminLayout from './components/AdminLayout/AdminLayout';
import ClientLayout from './components/ClientLayout/ClientLayout';
import InicioAdmin from './components/InicioAdmin/InicioAdmin';
import ResetPassword from './components/ResetPassword/ResetPassword';
import UsuariosAdmin from './components/UsuariosAdmin/UsuariosAdmin';
import DetalleUsuario from './components/UsuariosAdmin/DetalleUsuario';
import GestionAdmin from './components/GestionAdmin/GestionAdmin';
import CategoriasAdmin from './components/CategoriasAdmin/CategoriasAdmin';
import SubcategoriasAdmin from './components/SubcategoriasAdmin/SubcategoriasAdmin';
import ObrasAdmin from './components/ObrasAdmin/ObrasAdmin';
import EmpresasAdmin from './components/EmpresasAdmin/EmpresasAdmin';
import SolicitudesAdmin from './components/SolicitudesAdmin/SolicitudesAdmin';
import SolicitudesObras from './components/SolicitudesAdmin/SolicitudesObra';
import ArchivadosAdmin from './components/ArchivadosAdmin/ArchivadosAdmin';
import DetalleSolicitud from './components/SolicitudesAdmin/DetalleSolicitud';
import DetalleObra from './components/ObrasAdmin/DetalleObra';
import ClientSolicitudes from './components/ClientSolicitudes/ClientSolicitudes';
import ClientProfile from './components/ClientProfile/ClientProfile';
import AutoLogout from './services/Autologout';
import './index.css';

function App() {
  return (
    <Router>
        <AutoLogout>
          <Routes>
            <Route path="/" element={
              <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#7e9ab2' }}>
                <Header showLogout={false}/>
                <LoginPanel />
              </div>
            }/>

            <Route path="/recuperar" element={
              <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
                <Header showLogout={false} />
                <RecoverPassword />
              </div>
            } />
            <Route path="/reset-password" element={
              <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
                <Header showLogout={false} />
                <ResetPassword />
              </div>
            } />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<InicioAdmin />} />
              <Route path="dashboard" element={<div style={{color: 'white'}}>Dashboard</div>} />
              <Route path="solicitudes" element={<SolicitudesAdmin/>} />
              <Route path="solicitudes/empresa/:id" element={<SolicitudesObras/>} />
              <Route path="solicitudes/:id" element={<DetalleSolicitud />} />
              <Route path="gestion" element={<GestionAdmin />} />
              <Route path="gestion/categorias" element={<CategoriasAdmin />} />
              <Route path="gestion/subcategorias" element={<SubcategoriasAdmin />} />
              <Route path="gestion/empresas" element={<EmpresasAdmin />} />
              <Route path="gestion/obras" element={<ObrasAdmin/>}/>
              <Route path="gestion/obras/:id" element={<DetalleObra />} />
              <Route path="archivados" element={<ArchivadosAdmin/>}/>
              <Route path="gestion/usuarios" element={<UsuariosAdmin/>}/>
              <Route path="gestion/usuarios/:id" element={<DetalleUsuario />} />

            </Route>

            <Route path="/cliente" element={<ClientLayout />}>
              <Route index element={<ClientSolicitudes />} />
              <Route path="perfil" element={<ClientProfile />} />
            </Route>

            </Routes>
        </AutoLogout>
    </Router>
  );
}

export default App;
