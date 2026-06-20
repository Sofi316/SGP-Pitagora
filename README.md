# SGP Pitágora 🏗️

**Sistema de Gestión de Postventa**

> Aplicación web responsive modular diseñada para centralizar la información, optimizar los tiempos de respuesta y asegurar la trazabilidad técnica y legal de los requerimientos de postventa para la Constructora Pitágora S.A.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-green.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com/)
[![Docker](https://img.shields.io/badge/Docker-24.0.0-blue.svg)](https://www.docker.com/)

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
  - [Para Administradores](#para-administradores)
  - [Para Clientes](#para-clientes)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos del Sistema](#requisitos-del-sistema)
  - [Entorno de Ejecución](#entorno-de-ejecución)
  - [Permisos y Conectividad](#permisos-y-conectividad)
- [Instalación y Ejecución](#instalación-y-ejecución)
  - [Prerrequisitos](#prerrequisitos)
  - [Clonar e Instalar Dependencias](#clonar-e-instalar-dependencias)
  - [Configuración Local con Docker Compose](#configuración-local-con-docker-compose)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guía de Uso por Rol](#guía-de-uso-por-rol)
  - [Flujo de Administradores](#administradores)
  - [Flujo de Clientes](#clientes)
- [Endpoints API](#endpoints-api)
- [Guía de Desarrollo y Contribución](#guía-de-desarrollo-y-contribución)
- [Estándares](#estándares)
- [Notas Adicionales](#notas-adicionales)

---

## Descripción

SGP Pitágora es una solución tecnológica integral diseñada para resolver la dispersión de información provocada por canales informales como WhatsApp, llamadas telefónicas y correos electrónicos desarticulados. La plataforma unifica la gestión de incidencias, operando como una fuente única de verdad que garantiza un respaldo técnico auditable para el control de las garantías legales de construcción (3 años para terminaciones, 5 años para instalaciones y 10 años para estructura).

---

## Características Principales

### Para Administradores

- **Panel de Control Centralizado:** Visualización macro de solicitudes abiertas, en proceso y resueltas ordenadas por empresa y obra.
- **Gestión Estricta de Estados:** Control lineal de la máquina de estados de cada ticket: `PENDIENTE`, `EN_PROCESO`, `NO_APLICA`, `TERMINADO`, `APROBADO` y `RECHAZADO`.
- **Repositorio de Comunicaciones Archivadas:** Captura automática y centralizada de todos los correos electrónicos emitidos por la plataforma vinculados a cada ID de solicitud, asegurando un historial probatorio inalterable.
- **Módulo de Estimación de Costos:** Permite ingresar montos aproximados de reparación en las solicitudes finalizadas con fines meramente estadísticos y de cálculos internos de la empresa.
- **Reportes Analíticos:** Generación automática de indicadores clave de gestión y exportación directa a formatos Excel y PDF.

### Para Clientes

- **Acceso Restringido por Obra:** Aislamiento de datos basado en seguridad para que los inspectores visualicen únicamente los proyectos que tienen asignados.
- **Formulario Estandarizado de Incidentes:** Ingreso parametrizado de solicitudes en terreno con registro de fecha de hallazgo, descripción, ubicación exacta e imágenes de respaldo.
- **Firma Digital mediante Enlace Seguro:** Recepción automatizada de correos con tokens dinámicos temporales para validar o rechazar los trabajos directamente desde el celular sin necesidad de inicio de sesión tradicional.
- **Módulo de Calificación:** Evaluación de la calidad del servicio mediante un selector de satisfacción de 1 a 5 estrellas con comentarios de cierre.

---

## Stack Tecnológico

| Componente | Tecnología | Uso en el Sistema |
| :--- | :--- | :--- |
| **Capa de Presentación** | React 18.2 + Bootstrap 5.3 | Interfaz de usuario SPA, responsive y adaptada a terreno. |
| **Cliente HTTP** | Axios | Consumo de la API REST mediante promesas e interceptores. |
| **Lógica de Negocio** | Java 17 + Spring Boot 4.0 | Arquitectura del núcleo, control de flujos y API REST. |
| **Seguridad** | Spring Security + Stateless JWT | Autenticación de usuarios y protección estricta de endpoints. |
| **Persistencia** | Spring Data JPA (Hibernate) | Mapeo objeto-relacional y control de transacciones SQL. |
| **Base de Datos** | PostgreSQL 16 | Motor relacional para el almacenamiento persistente estructurado. |
| **Contenedores** | Docker + Docker Compose | Aislamiento de entornos de desarrollo, QA y producción. |

---

## Requisitos del Sistema

#### Entorno de Ejecución
- **Navegador Web:** Google Chrome, Mozilla Firefox, Safari o Microsoft Edge en sus versiones actualizadas.
- **Resolución Mínima:** Optimizado para pantallas móviles desde 360px de ancho en adelante (Mobile-First).
- **Servidor (Despliegue):** Compatibilidad con entornos PaaS (Vercel para Frontend, Render para Backend, Supabase para persistencia).

#### Permisos y Conectividad
- Acceso a Internet mediante redes móviles (3G/4G/5G) o redes WiFi corporativas.
- Permisos de acceso a la cámara o almacenamiento de archivos del dispositivo móvil para la carga de evidencias fotográficas en los formularios.

---

## Instalación y Ejecución

### Prerrequisitos
Asegúrese de tener instalados los siguientes componentes globales en su sistema:
```bash
# Verificar la instalación de Docker y Docker Compose
docker --version
docker compose version
```
### Configuración de Almacenamiento (Supabase): 
El módulo de gestión de evidencias requiere obligatoriamente la creación manual de dos buckets en el panel de su proyecto de Supabase (Storage) antes de levantar la API. Ambos deben estar configurados como Públicos:
 - acta_entrega

 - archivo_evidencia
### Clonar e Instalar Dependencias

1. Clonar el repositorio completo del proyecto:

```bash
git clone https://github.com/Sofi316/SGP-Pitagora.git
cd SGP-Pitagora

```

2. Instalar las dependencias locales del cliente de forma opcional (para desarrollo fuera de contenedores):

```bash
cd Producto/frontend
npm install

```

### Configuración Local con Docker Compose

Para asegurar la paridad absoluta de entornos y levantar la infraestructura completa (Frontend + Backend) con un único comando, ejecute en la raíz del proyecto:

```bash
# Levantar los contenedores en segundo plano
docker-compose up -d

```

El sistema mapeará automáticamente el puerto `8080` para el servidor API de Spring Boot y el puerto `3000` para la aplicación React SPA.

---

## Variables de Entorno

Para garantizar la seguridad de las credenciales y facilitar la configuración en distintos entornos (desarrollo, pruebas y producción), el sistema utiliza variables de entorno externas. Antes de ejecutar la aplicación, cree un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```properties
# ==========================================
# BASE DE DATOS (PostgreSQL / Supabase)
# ==========================================
DB_URL=jdbc:postgresql://<HOST>:5432/<DATABASE>?sslmode=require
DB_USERNAME=<USUARIO>
DB_PASSWORD=<CONTRASEÑA>

# ==========================================
# SEGURIDAD JWT Y CORS
# ==========================================
JWT_SECRET_KEY=<CLAVE_SECRETA_JWT>
FRONTEND_URL=${FRONTEND_URL:http://localhost:3000}

# ==========================================
# CORREO ELECTRÓNICO (SMTP)
# ==========================================
MAIL_USERNAME=<CORREO_SMTP>
MAIL_PASSWORD=<CLAVE_DE_APLICACION_SMTP>

# ==========================================
# SUPABASE
# ==========================================
SUPABASE_URL=https://<PROYECTO>.supabase.co
SUPABASE_SERVICE_KEY=<SUPABASE_SERVICE_KEY>

# ==========================================
# ADMINISTRADOR INICIAL
# ==========================================
ADMIN_INIT_EMAIL=<CORREO_ADMINISTRADOR>
ADMIN_INIT_PASSWORD=<CONTRASEÑA_ADMINISTRADOR>
ADMIN_INIT_RUT=<RUT_ADMINISTRADOR>
```

### Descripción de Variables

| Variable | Descripción |
|-----------|-------------|
| `DB_URL` | Cadena de conexión a la base de datos PostgreSQL. |
| `DB_USERNAME` | Usuario con permisos de acceso a la base de datos. |
| `DB_PASSWORD` | Contraseña del usuario de la base de datos. |
| `JWT_SECRET_KEY` | Clave utilizada para la generación y validación de tokens JWT. |
| `FRONTEND_URL` | URL del origen permitido para el cruce de recursos (CORS) desde la interfaz cliente. |
| `MAIL_USERNAME` | Cuenta de correo utilizada para el envío automático de notificaciones. |
| `MAIL_PASSWORD` | Contraseña o clave de aplicación del servicio de correo. |
| `SUPABASE_URL` | URL de la instancia de Supabase utilizada por la aplicación. |
| `SUPABASE_SERVICE_KEY` | Clave de servicio con permisos administrativos sobre Supabase. |
| `ADMIN_INIT_EMAIL` | Correo electrónico del administrador inicial del sistema. |
| `ADMIN_INIT_PASSWORD` | Contraseña inicial del administrador. |
| `ADMIN_INIT_RUT` | RUT asociado al administrador inicial. |

### Consideraciones de Seguridad

> **Importante:** El archivo `.env` contiene información sensible y no debe ser almacenado en el repositorio. Se recomienda agregarlo al archivo `.gitignore` para evitar la exposición accidental de credenciales.

```gitignore
.env
```

> **Nota:** Reemplace todos los valores entre `< >` por los datos correspondientes a su entorno antes de ejecutar la aplicación.

---

## Estructura del Proyecto

```text
Proyecto/
├── Gestion/                     # Archivos de gestión del proyecto 
├── Documentacion/               # Documentación técnica, funcional y de usuario
├── Producto/                    # Código fuente principal del sistema
│   ├── backend/                 # API REST y lógica de negocio desarrollada con Spring Boot
│   │   ├── .mvn/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/pitagora/backend/SGP_Pitagora/
│   │   │   │   │   ├── config/         # Configuraciones generales y de seguridad
│   │   │   │   │   ├── controller/     # Controladores REST
│   │   │   │   │   ├── dto/            # Objetos de transferencia de datos
│   │   │   │   │   ├── model/          # Entidades y modelos JPA
│   │   │   │   │   ├── repository/     # Acceso a datos y consultas
│   │   │   │   │   ├── service/        # Lógica de negocio
│   │   │   │   │   └── SgpPitagoraApplication.java
│   │   │   │   └── resources/
│   │   │   └── test/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   └── frontend/                # Aplicación web SPA desarrollada con React
│       ├── public/
│       ├── src/
│       │   ├── assets/          # Recursos estáticos (imágenes, iconos, etc.)
│       │   ├── components/      # Componentes reutilizables de la interfaz
│       │   ├── services/        # Servicios de comunicación con la API
│       │   ├── App.js
│       │   └── index.js
│       ├── Dockerfile
│       └── package.json
└── README.md

```

---

## Guía de Uso por Rol

### Administradores

1. **Inicio de Sesión:** Autenticación mediante credenciales corporativas provistas.
2. **Poblamiento de Datos:** Ingreso secuencial de registros base en el panel de Gestión (Empresas → Obras → Usuarios → Categorías).
3. **Flujo de Trabajo:** Recepción de la solicitud en estado `PENDIENTE`. Modificación manual a `EN PROCESO` o `NO APLICA` al ser revisada. Carga de fotos de reparación finalizada y cambio de estado a `TERMINADO` registrando el costo estimado para calulos internos.
4. **Auditoría:** Revisión de la pestaña de "Comunicaciones Archivadas" para consultar historial de solciitudes.

### Clientes

1. **Reporte en Terreno:** Acceso a su cuenta, ingreso a su obra asignada y declaración de hallazgos mediante el formulario web responsive.
2. **Revisión de Estado:** Apertura del enlace directo recibido en su correo electrónico cuando la constructora cambia el estado de su solicitud.
3. **Cierre Formal:** Inspección de las imágenes de reparación añadidas. Selección de la opción **Aprobar** incorporando la evaluación por estrellas (1-5) o selección de la opción **Rechazar** ingresando de forma obligatoria el motivo técnico detallado.

---

## API REST

El backend expone una API REST desarrollada con Spring Boot, encargada de la gestión de usuarios, empresas, obras, solicitudes de postventa, evidencias fotográficas, notificaciones y procesos de conformidad.

### URL Base

**Entorno Local**

```text
http://localhost:8080/api
```

### Documentación de la API

La documentación interactiva de la API está disponible mediante Swagger/OpenAPI una vez que el backend se encuentra en ejecución:

```text
http://localhost:8080/swagger-ui/index.html
```

### Principales Módulos

- Autenticación y autorización mediante JWT.
- Gestión de usuarios.
- Gestión de empresas.
- Gestión de obras.
- Gestión de solicitudes de postventa.
- Gestión de evidencias fotográficas.
- Gestión de correos electrónicos.
- Gestión de conformidades.
- Reportes e indicadores de gestión.

> Para consultar el detalle completo de endpoints, parámetros, modelos de datos y respuestas HTTP, utilice la documentación Swagger incluida en el proyecto.

---
## Guía de Desarrollo y Contribución

1. Realizar un *Fork* del repositorio oficial del proyecto.
2. Crear una rama de desarrollo para incorporar nuevas características técnicas:

```bash
git checkout -b feature/nueva-funcionalidad-solicitada

```

3. Realizar las modificaciones correspondientes en el código fuente, asegurando la mantención de la cohesión arquitectónica.
4. Ejecutar pruebas de regresión en el entorno local utilizando la orquestación de Docker Compose para certificar la compatibilidad de red.
5. Confirmar los cambios implementando la convención de commits descriptivos:

```bash
git commit -m "feat: implementa despliegue dinamico de estrellas en bloque de conformidad"

```

6. Enviar los cambios mediante un *Pull Request* detallando con precisión el impacto del código en las capas afectadas.

---

## Estándares

* **Capa Lógica Limpia (Clean Code):** Arquitectura del backend estructurada bajo un patrón multicapa (Layered Architecture) para desacoplamiento estricto de responsabilidades. Se implementa un modelo de API REST donde los controladores (`Controllers`) actúan exclusivamente como puntos de entrada para derivar peticiones HTTP, la capa de servicios (`Services`) centraliza las reglas de negocio, y los repositorios (`Repositories` / Spring Data JPA) aíslan los accesos y consultas a la base de datos PostgreSQL.
* **Normalización de Base de Datos:** Modelo relacional en tercera forma normal (3FN) con integridad referencial completa y uso de tablas intermedias (muchos a muchos) para el aislamiento de datos por usuario.
* **Encapsulamiento en Frontend:** Uso exclusivo de CSS Modules (`.module.css`) por cada componente visual de React para mitigar la colisión global de estilos en pantallas de celulares.

---

## Notas Adicionales

* **Entorno Académico:** Este proyecto ha sido desarrollado como pieza de software central para el proceso de titulación de la carrera Analista Programador en la Escuela de Informática y Telecomunicaciones de DuocUC.
* **Localización Chilena:** El sistema cuenta con validación algorítmica nativa de RUT, ordenamiento geográfico estructurado bajo las entidades político-administrativas de Regiones y Comunas de Chile, y soporte para visualización de formatos monetarios bajo el estándar local `es-CL`.
* **Cierre Expreso por Inactividad:** Se incluye un proceso automatizado por lotes que evalúa diariamente las solicitudes en estado `TERMINADO`. Si un token de conformidad cumple **4 semanas continuas** sin registrar interacciones por parte del cliente, el sistema procesará automáticamente el estado `APROBADO` por defecto para resguardar la fluidez del negocio.


---

## Autores

Proyecto desarrollado por estudiantes de la carrera Analista Programador de Duoc UC.

| Integrante | 
|------------|
| Sofía Hormazabal |
| Romina Hormazabal |
| Fabián Sanhueza |

---

**SGP Pitágora**  
Sistema de Gestión de Postventa 
Proyecto de Titulación — Duoc UC
