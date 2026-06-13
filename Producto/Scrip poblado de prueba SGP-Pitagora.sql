-- 1. REGIONES
INSERT INTO region (nombre_region) VALUES 
('Región Metropolitana'),
('Región de Valparaíso'),
('Región del Biobío');

-- 2. ESTADOS DE SOLICITUD
INSERT INTO estado_solicitud (nombre_estado) VALUES 
('PENDIENTE'),
('EN_PROCESO'),
('NO_APLICA'),
('TERMINADO'),
('APROBADO'),
('RECHAZADO');

-- 3. ROLES
INSERT INTO rol (nombre_rol, descripcion_rol) VALUES 
('ADMINISTRADOR', 'Gestión total del sistema y técnico de postventa'),
('CLIENTE', 'Usuario que reporta hallazgos en obras');

-- 4. CATEGORÍAS
INSERT INTO categoria (nombre_categoria, activo) VALUES 
('Instalaciones Eléctricas', TRUE),
('Terminaciones y Pintura', TRUE),
('Gasfitería y Redes Humedas', TRUE),
('Carpintería y Muebles', TRUE);

-- 5. TIPOS DE EVIDENCIA
INSERT INTO tipo_evidencia (nombre_tipo_evidencia) VALUES 
('FOTOGRAFIA'),
('DOCUMENTO_PDF'),
('ACTA_FIRMA');

-- 6. EMPRESA CLIENTE
INSERT INTO empresa_cliente (rut_empresa, razon_social, activo) VALUES 
('76.123.456-7', 'Inmobiliaria Nueva Vida S.A.', TRUE),
('77.987.654-K', 'Constructora Cimientos Fuertes Ltda.', TRUE);

-- 7. COMUNAS
INSERT INTO comuna (nombre_comuna, id_region) VALUES 
('Maipú', 1),
('Santiago', 1),
('Viña del Mar', 2),
('Concepción', 3);

-- 8. SUBCATEGORÍAS
INSERT INTO subcategoria (nombre_subcategoria, activo, id_categoria) VALUES 
('Falla en enchufes', TRUE, 1),
('Fisura en muro', TRUE, 2),
('Filtración en lavaplatos', TRUE, 3),
('Puerta descuadrada', TRUE, 4);

-- 9. USUARIOS
INSERT INTO usuario (rut, nombre, apellido, correo, contrasena, celular, cargo, activo, recibe_notificaciones, id_rol) VALUES 
('18.456.789-0', 'Romina', 'Analista', 'admin@pitagora.cl', 'password_hash_here', '912345678', 'Administrador Postventa', TRUE, TRUE, 1),
('20.111.222-3', 'Juan', 'Pérez', 'juan.perez@cliente.cl', 'password_hash_here', '987654321', 'Propietario', TRUE, TRUE, 2);

-- 10. OBRAS
INSERT INTO obra (nombre_obra, direccion_obra, fecha_inicio_postventa, fecha_cierre_postventa, activo, id_empresa_cliente, id_comuna) VALUES 
('Edificio Altura Real', 'Av. Pajaritos 1234', '2025-01-01', '2027-01-01', TRUE, 1, 1),
('Condominio El Parque', 'Libertad 456', '2024-06-01', '2026-06-01', TRUE, 2, 3);

-- 11. USUARIO_OBRA
INSERT INTO usuario_obra (id_usuario, id_obra) VALUES 
(2, 1);

-- 12. SOLICITUDES
INSERT INTO solicitud (fecha_hallazgo, descripcion, ubicacion_exacta, activo, id_estado, id_subcategoria, id_usuario, id_obra) VALUES 
('2026-05-01', 'Se observa mancha de humedad en el techo del baño principal.', 'Departamento 402, Baño suite', TRUE, 1, 3, 2, 1),
('2026-05-05', 'Enchufe del living no tiene corriente al conectar electrodomésticos.', 'Departamento 402, Muro este living', TRUE, 2, 1, 2, 1);

-- 13. ARCHIVO_EVIDENCIA
INSERT INTO archivo_evidencia (ruta_archivo, id_tipo_evidencia, id_solicitud) VALUES 
('https://supabase.storage/evidencia/humedad_402.jpg', 1, 1),
('https://supabase.storage/evidencia/enchufe_falla.jpg', 1, 2);

-- 14. COMUNICACIÓN ARCHIVADA
INSERT INTO comunicacion_archivada (external_message_id, asunto, cuerpo_mensaje, remitente, destinatario, fecha_envio, id_solicitud) VALUES 
('<msg001@mail.com>', 'RE: Solicitud #1 - Humedad', 'Hola Juan, hemos recibido su reporte. Mañana irá un técnico a revisar la filtración.', 'admin@pitagora.cl', 'juan.perez@cliente.cl', '2026-05-02 10:00:00-04', 1),
('<msg002@mail.com>', 'RE: Solicitud #1 - Humedad', 'Perfecto, estaré atento entre las 9:00 y las 13:00 horas.', 'juan.perez@cliente.cl', 'admin@pitagora.cl', '2026-05-02 11:30:00-04', 1);