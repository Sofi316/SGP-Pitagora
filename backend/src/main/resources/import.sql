
INSERT INTO rol (nombre_rol, descripcion_rol) VALUES ('ADMIN', 'Administrador total del sistema');
INSERT INTO rol (nombre_rol, descripcion_rol) VALUES ('CLIENTE', 'Usuario final');

INSERT INTO region (nombre_region) VALUES ('Arica y Parinacota');
INSERT INTO region (nombre_region) VALUES ('Tarapacá');
INSERT INTO region (nombre_region) VALUES ('Antofagasta');
INSERT INTO region (nombre_region) VALUES ('Atacama');
INSERT INTO region (nombre_region) VALUES ('Coquimbo');
INSERT INTO region (nombre_region) VALUES ('Valparaíso');
INSERT INTO region (nombre_region) VALUES ('Libertador General Bernardo O''Higgins');
INSERT INTO region (nombre_region) VALUES ('Maule');
INSERT INTO region (nombre_region) VALUES ('Ñuble');
INSERT INTO region (nombre_region) VALUES ('Biobío');
INSERT INTO region (nombre_region) VALUES ('Araucanía');
INSERT INTO region (nombre_region) VALUES ('Los Ríos');
INSERT INTO region (nombre_region) VALUES ('Los Lagos');
INSERT INTO region (nombre_region) VALUES ('Aysén del General Carlos Ibáñez del Campo');
INSERT INTO region (nombre_region) VALUES ('Magallanes y de la Antártica Chilena');
INSERT INTO region (nombre_region) VALUES ('Metropolitana de Santiago');


INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('Santiago', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('Lampa', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('San Joaquín', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('Las Condes', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('La Florida', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('San Bernardo', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('Peñalolén', 16);
INSERT INTO comuna (nombre_comuna, id_region ) VALUES ('Pudahuel', 16);

INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Arica', 1);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Iquique', 2);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Antofagasta', 3);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Calama', 3);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Viña del Mar', 6);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Valparaíso', 6);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Concepción', 10);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Temuco', 11);
INSERT INTO comuna (nombre_comuna,id_region ) VALUES ('Puerto Montt', 13);

INSERT INTO estado_solicitud (nombre_estado) VALUES ('Pendiente');
INSERT INTO estado_solicitud (nombre_estado) VALUES ('En Proceso');
INSERT INTO estado_solicitud (nombre_estado) VALUES ('Terminado');
INSERT INTO estado_solicitud (nombre_estado) VALUES ('Aprobado');
INSERT INTO estado_solicitud (nombre_estado) VALUES ('Rechazado');
INSERT INTO estado_solicitud (nombre_estado) VALUES ('No aplica');

INSERT INTO tipo_evidencia (nombre_tipo_evidencia) VALUES ('Estado');
INSERT INTO tipo_evidencia (nombre_tipo_evidencia) VALUES ('Reparacion');

INSERT INTO categoria (nombre_categoria, activo) VALUES ('Terminaciones Pisos', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Terminaciones Muros', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Terminaciones Cielos', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Puertas y/o Ventanas', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Mobiliario', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Cubierta', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Sanitario', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Eléctrico', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Climatización', true)
INSERT INTO categoria (nombre_categoria, activo) VALUES ('Otro', true)

INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 1)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 2)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 3)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 4)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 5)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 6)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 7)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 8)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 9)
INSERT INTO subcategoria (nombre_subcategoria, activo,id_categoria) VALUES ('Otro', true, 10)

