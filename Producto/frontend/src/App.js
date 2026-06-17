import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import LoginPanel from './components/LoginPanel/LoginPanel';
import RecoverPassword from './components/RecoverPassword/RecoverPassword';
import AdminLayout from './components/AdminLayout/AdminLayout';
import ClientLayout from './components/ClientLayout/ClientLayout';
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
import ClientUsuarioDetalle from './components/ClientUsuarioDetalle/ClientUsuarioDetalle';
import AutoLogout from './services/Autologout';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import ClientDetalleSolicitud from './components/ClientDetalleSolicitud/ClientDetalleSolicitud';
import ConformidadCliente from './components/ConformidadCliente/ConformidadCliente';
import RutaInvitado from './components/RutaInvitado/RutaInvitado';
import './index.css';

function App() {
  return (
    <Router>
        <AutoLogout>
          <Routes>
            <Route path="/" element={
              <RutaInvitado>
              <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#7e9ab2' }}>
                <Header showLogout={false}/>
                <LoginPanel />
              </div>
              </RutaInvitado>
            }/>
      
            <Route path="/recuperar" element={
              <RutaInvitado>
              <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
                <Header showLogout={false} />
                <RecoverPassword />
              </div>
              </RutaInvitado>
            } />
            <Route path="/reset-password" element={
              <RutaInvitado>
              <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
                <Header showLogout={false} />
                <ResetPassword />
              </div>
              </RutaInvitado>
            } />
            <Route path="/conformidad/:token" element={
              <ConformidadCliente />} />

            <Route path="/admin" element={<AdminLayout />}>
              {/* Redirige automáticamente al dashboard si entran a /admin vacío */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard/>} />
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
              <Route path="perfil" element={<ClientUsuarioDetalle/>} />
              <Route path="solicitudes/:id" element={<ClientDetalleSolicitud/>} />
            </Route>

          </Routes>
        </AutoLogout>
    </Router>
  );
}

export default App;