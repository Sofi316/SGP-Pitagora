# SGP Pitágora 🏗️

**Sistema de Gestión de Postventa Automatizado**

> Plataforma web modular fullstack diseñada para optimizar, centralizar y auditar el ciclo de vida completo de los requerimientos de postventa e inspección técnica para la Constructora Pitágora S.A.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-purple.svg)](https://getbootstrap.com/)
[![Maven](https://img.shields.io/badge/Maven-3.8.1-red.svg)](https://maven.apache.org/)

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
  - [Módulo de Administración](#módulo-de-administración)
  - [Módulo de Clientes](#módulo-de-clientes)
  - [Módulo de Cierre y Conformidad Comercial](#módulo-de-cierre-y-conformidad-comercial)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación y Ejecución](#instalación-y-ejecución)
  - [Prerrequisitos](#prerrequisitos)
  - [Configuración del Servidor (Backend)](#configuración-del-servidor-backend)
  - [Configuración del Cliente (Frontend)](#configuración-del-cliente-frontend)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guía de Flujos y Estados](#guía-de-flujos-y-estados)
- [Endpoints Principales de la API](#endpoints-principales-de-la-api)
- [Guía de Desarrollo y Contribución](#guía-de-desarrollo-y-contribución)
- [Estándares de Calidad](#estándares-de-calidad)
- [Notas Adicionales](#notas-adicionales)

---

## Descripción

SGP Pitágora es una solución tecnológica que reemplaza los procesos tradicionales desarticulados (planillas de cálculo, reportes en papel y cadenas de correos informales) por un ecosistema digital web centralizado y robusto. La plataforma conecta de manera directa a los administradores de la constructora con las contrapartes técnicas de las empresas mandantes e inspectores de obra, asegurando la transparencia y la trazabilidad financiera de cada reparación en el contexto chileno.

---

## Características Principales

### Módulo de Administración
- **Dashboard e Indicadores:** Gráficos estadísticos y volumétricos interactivos de fallas agrupadas por proyectos, comunas y estados lógicos del negocio.
- **Gestión de Entidades Maestras:** Módulos CRUD para el control estricto de Regiones, Comunas, Empresas Clientes, Proyectos/Obras, Subcategorías técnicas de fallas y Usuarios.
- **Liquidación Financiera:** Panel exclusivo para la digitación y reajuste de los costos asociados a las reparaciones y mano de obra en terreno.
- **Control de Evidencias:** Carga y despliegue modular de archivos fotográficos y documentos en formato PDF que sustentan el avance de la obra.

### Módulo de Clientes
- **Visualización Jerárquica:** Interfaz intuitiva y responsive optimizada para dispositivos móviles en terreno que agrupa los tickets activos de forma exclusiva por las obras vinculadas a la cuenta del cliente.
- **Formulario de Requerimientos:** Ingreso parametrizado de fallas con fecha de hallazgo, descripción del problema, ubicación exacta y pre-carga de imágenes de hallazgo.
- **Gestión de Perfil:** Edición directa de información personal y actualización segura de credenciales de acceso.

### Módulo de Cierre y Conformidad Comercial
- **Tokens Públicos de Seguridad:** Mecanismo que despacha correos automáticos al cliente con un enlace dinámico temporal único cifrado para auditar el trabajo.
- **Firma Digital de Conformidad:** Interfaz pública de evaluación donde el cliente aprueba o rechaza el trabajo sin necesidad de iniciar sesión, exigiendo una calificación de 1 a 5 estrellas si aprueba o el ingreso obligatorio de un motivo de rechazo si deniega el ticket.
- **Cierre Expreso por Inactividad:** Regla automatizada en segundo plano que procesa la aprobación automática del caso si se cumplen 4 semanas continuas de silencio comercial tras el envío del token.

---

## Stack Tecnológico

| Componente | Tecnología | Uso en el Sistema |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.2 | SPA para renderizado dinámico de interfaces y layouts. |
| **Estilos y Layout** | Bootstrap 5.3 | Diseño responsivo para terreno y adaptabilidad móvil. |
| **Gráficos** | Recharts | Renderizado de métricas y métricas analíticas en Dashboard. |
| **Cliente HTTP** | Axios | Consumo de recursos de la API REST mediante promesas. |
| **Enrutamiento** | React Router Dom 6 | Manejo de navegación interna y guardianes de rutas. |
| **Backend Core** | Java 17 + Spring Boot 3.2 | Arquitectura REST corporativa y lógica de negocio. |
| **Seguridad** | Spring Security | Autenticación y autorización basada en Stateless JWT. |
| **Persistencia** | Spring Data JPA (Hibernate) | Mapeo objeto-relacional y abstracción de consultas SQL. |
| **Base de Datos** | PostgreSQL 16 | Motor de base de datos relacional para almacenamiento persistente. |
| **Construcción** | Maven | Gestión automatizada de dependencias y empaquetado JAR. |

---

## Requisitos del Sistema

### Servidor de Producción / Nube (Recomendado Free Tier)
- **Runtime Backend:** JRE 17 instalado (Hospedado en Render Web Services).
- **Hosting Frontend:** Soporte para SPA estáticas (Hospedado en Vercel CDN).
- **Instancia Base de Datos:** PostgreSQL 16+ activo (Hospedado en Supabase / Neon).
- **Memoria Mínima:** 512 MB RAM asignados al proceso de Java.

### Cliente (Dispositivo de Acceso)
- **Navegadores Soportados:** Google Chrome, Mozilla Firefox, Microsoft Edge, Safari.
- **Adaptabilidad:** Pantallas móviles desde 360px de ancho en adelante.
- **Conectividad:** Acceso a Internet vía redes móviles 3G/4G/5G o WiFi corporativa.

---

## Instalación y Ejecución

### Prerrequisitos
Instalar de manera local en la estación de trabajo:
- Java Development Kit (JDK) 17
- Node.js (Versión LTS recomendada)
- Apache Maven 3.8+
- PostgreSQL Server 16

### Configuración del Servidor (Backend)

1. Clonar el repositorio e ingresar al directorio de la API:
```bash
git clone [https://github.com/TuUsuario/SGP_Pitagora.git](https://github.com/TuUsuario/SGP_Pitagora.git)
cd SGP_Pitagora/backend
