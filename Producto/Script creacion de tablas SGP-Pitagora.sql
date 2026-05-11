DROP TABLE IF EXISTS comunicacion_archivada CASCADE;
DROP TABLE IF EXISTS archivo_evidencia CASCADE;
DROP TABLE IF EXISTS solicitud CASCADE;
DROP TABLE IF EXISTS obra CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS subcategoria CASCADE;
DROP TABLE IF EXISTS comuna CASCADE;
DROP TABLE IF EXISTS empresa_cliente CASCADE;
DROP TABLE IF EXISTS tipo_evidencia CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS rol CASCADE;
DROP TABLE IF EXISTS estado_solicitud CASCADE;
DROP TABLE IF EXISTS region CASCADE;

CREATE TABLE region (
    id_region SERIAL PRIMARY KEY,
    nombre_region VARCHAR(60) NOT NULL
);

CREATE TABLE estado_solicitud (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(20) NOT NULL UNIQUE
);
CREATE TABLE rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL UNIQUE,
    descripcion_rol VARCHAR(50) NOT NULL
);

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE tipo_evidencia (
    id_tipo_evidencia SERIAL PRIMARY KEY,
    nombre_tipo_evidencia VARCHAR(20) NOT NULL
);

CREATE TABLE empresa_cliente (
    id_empresa_cliente SERIAL PRIMARY KEY,
    rut_empresa VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(40) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE comuna (
    id_comuna SERIAL PRIMARY KEY,
    nombre_comuna VARCHAR(20) NOT NULL,
    id_region INTEGER NOT NULL,
    CONSTRAINT fk_comuna_region FOREIGN KEY (id_region) REFERENCES region(id_region)
);

CREATE TABLE subcategoria (
    id_subcategoria SERIAL PRIMARY KEY,
    nombre_subcategoria VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    id_categoria INTEGER NOT NULL,
    CONSTRAINT fk_subcategoria_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    rut VARCHAR(11) NOT NULL UNIQUE,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(25) NOT NULL,
    correo VARCHAR(40) NOT NULL UNIQUE,
    contrasena TEXT NOT NULL,
    celular VARCHAR(9),
    cargo VARCHAR(40),
    recibe_notificaciones BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    token_recuperacion TEXT,
    token_expiracion TIMESTAMPTZ,
    id_rol INTEGER NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE obra (
    id_obra SERIAL PRIMARY KEY,
    nombre_obra VARCHAR(50) NOT NULL,
    direccion_obra VARCHAR(100) NOT NULL,
    fecha_inicio_postventa DATE NOT NULL,
    fecha_cierre_postventa DATE NOT NULL,
    ruta_acta_entrega TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    id_empresa_cliente INTEGER NOT NULL,
    id_comuna INTEGER NOT NULL,
    CONSTRAINT fk_obra_empresa FOREIGN KEY (id_empresa_cliente) REFERENCES empresa_cliente(id_empresa_cliente),
    CONSTRAINT fk_obra_comuna FOREIGN KEY (id_comuna) REFERENCES comuna(id_comuna)
);

CREATE TABLE usuario_obra (
    id_usuario INTEGER NOT NULL,
    id_obra INTEGER NOT NULL,
    PRIMARY KEY (id_usuario, id_obra),
    CONSTRAINT fk_uo_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_uo_obra FOREIGN KEY (id_obra) REFERENCES obra(id_obra)
);
CREATE TABLE solicitud (
    id_solicitud SERIAL PRIMARY KEY,
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_hallazgo DATE NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion_exacta VARCHAR(100) NOT NULL,
    token_validacion VARCHAR(255) UNIQUE,
    fecha_firma TIMESTAMPTZ,
    comentario_cierre VARCHAR(250),
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    id_estado INTEGER NOT NULL,
    id_subcategoria INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_obra INTEGER NOT NULL,
    CONSTRAINT fk_solicitud_estado FOREIGN KEY (id_estado) REFERENCES estado_solicitud(id_estado),
    CONSTRAINT fk_solicitud_subcategoria FOREIGN KEY (id_subcategoria) REFERENCES subcategoria(id_subcategoria),
    CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_solicitud_obra FOREIGN KEY (id_obra) REFERENCES obra(id_obra)
);
CREATE TABLE archivo_evidencia (
    id_archivo SERIAL PRIMARY KEY,
    ruta_archivo TEXT NOT NULL,
    id_tipo_evidencia INTEGER NOT NULL,
    id_solicitud INTEGER NOT NULL,
    CONSTRAINT fk_archivo_tipo FOREIGN KEY (id_tipo_evidencia) REFERENCES tipo_evidencia(id_tipo_evidencia),
    CONSTRAINT fk_archivo_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud)
);

CREATE TABLE comunicacion_archivada (
    id_comunicacion SERIAL PRIMARY KEY,
    external_message_id VARCHAR(255) UNIQUE,
    asunto VARCHAR(250) NOT NULL,
    cuerpo_mensaje TEXT NOT NULL,
    remitente VARCHAR(150) NOT NULL,
    destinatario VARCHAR(150) NOT NULL,
    fecha_envio TIMESTAMPTZ NOT NULL,
    id_solicitud INTEGER NOT NULL,
    CONSTRAINT fk_comunicacion_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud)
);
