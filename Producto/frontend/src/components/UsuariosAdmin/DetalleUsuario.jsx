import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './DetalleUsuario.module.css';
import { FaUser, FaIdCard, FaHardHat } from "react-icons/fa";
import ModalEditarUsuario from './ModalEditarUsuario';
import ModalEliminarUsuario from './ModalEliminarUsuario';

const DetalleUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [todasLasObras, setTodasLasObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resUsu, resRol, resObr] = await Promise.all([
        api.get(`/usuarios/${id}`),
        api.get('/roles').catch(() => ({ data: [] })),
        api.get('/obras').catch(() => ({ data: [] }))
      ]);
      setUsuario(resUsu.data);
      setRoles(resRol.data);
      setTodasLasObras(resObr.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los detalles del usuario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const handleSuccess = () => {
    cargarDatos();
  };

  const handleEliminarSuccess = () => {
    navigate('/admin/gestion/usuarios');
  };

  if (loading) return <div className={styles.container}><p className={styles.loadingText}>Cargando detalles...</p></div>;
  if (error) return <div className={styles.container}><p className={styles.errorText}>{error}</p></div>;
  if (!usuario) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleContainer}>
          <Link to="/admin/gestion/usuarios" className={styles.backButton}>←</Link>
          <h1 className={styles.title}>Detalle de Usuario</h1>
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <h2 className={styles.obraNombre}>{usuario.nombre} {usuario.apellido}</h2>
                <span className={`${styles.badge} ${usuario.activo ? styles.badgeActiva : styles.badgeInactiva}`}>
                    {usuario.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </span>
            </div>
            <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => setShowEditModal(true)}>Editar</button>
                <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>Eliminar</button>
            </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaIdCard /> Información Personal</h3>
            <p className={styles.detailText}><strong>RUT:</strong> {usuario.rut}</p>
            <p className={styles.detailText}><strong>Correo:</strong> {usuario.correo}</p>
            <p className={styles.detailText}><strong>Celular:</strong> {usuario.celular || 'N/A'}</p>
            <p className={styles.detailText}><strong>Notificaciones:</strong> {usuario.recibe_notificaciones ? 'Sí' : 'No'}</p>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitleIcons}><FaUser /> Rol y Cargo</h3>
            <p className={styles.detailText}><strong>Cargo:</strong> {usuario.cargo || 'N/A'}</p>
            <p className={styles.detailText}><strong>Rol en sistema:</strong> {usuario.rol?.nombre || 'N/A'}</p>
          </div>

          <div className={styles.sectionCard} style={{ gridColumn: '1 / -1' }}>
            <h3 className={styles.sectionTitleIcons}><FaHardHat /> Obras Asignadas</h3>
            {usuario.obras && usuario.obras.length > 0 ? (
              <ul className={styles.listObras}>
                {usuario.obras.map(obra => (
                  <li key={obra.id} className={styles.detailText}>{obra.nombre}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.noObras}>El usuario no tiene obras asignadas actualmente.</p>
            )}
          </div>
        </div>
      </div>

      <ModalEditarUsuario
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        usuarioOriginal={usuario}
        roles={roles}
        todasLasObras={todasLasObras}
        onSuccess={handleSuccess}
      />

      <ModalEliminarUsuario
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        usuario={usuario}
        onSuccess={handleEliminarSuccess}
      />
    </div>
  );
};

export default DetalleUsuario;