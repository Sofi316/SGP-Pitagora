**SGP Pitágora - Sistema de Gestión de Postventa**

SGP Pitágora es una plataforma web modular diseñada para la Constructora Pitágoras S.A., cuyo propósito es modernizar y automatizar el área de atención al cliente y postventa
. El sistema reemplaza la gestión manual y desarticulada por un proceso centralizado, robusto y escalable
.

**Contexto y Diagnóstico**

La constructora gestiona actualmente sus solicitudes de postventa de forma 100% manual, dependiendo de canales informales como WhatsApp, correos electrónicos y llamadas telefónicas
. Esta operatividad informal genera:
- Pérdida de trazabilidad legal: Riesgo crítico ante garantías legales de 3 años (terminaciones), 5 años (instalaciones) y 10 años (estructuras) que respaldan contratos de alta envergadura
.
- Caos operativo: Dependencia de la revisión humana para recopilar información dispersa y falta de indicadores de gestión
.
- Amenaza a la fidelización: El desorden en la comunicación afecta la relación de confianza con clientes estratégicos como la Universidad Católica y Komatsu
.

**Objetivos del Proyecto**

Objetivo General

Desarrollar una plataforma web robusta y escalable que permita centralizar la gestión de solicitudes, asegurar la trazabilidad total de los tickets e integrar Inteligencia Artificial básica para optimizar el análisis de datos
.

Objetivos Específicos

- Centralización: Implementar formularios estandarizados para el ingreso de tickets con seguimiento automático de estados (En proceso, No aplica, Terminado)
.
- Inteligencia: Integrar un módulo de análisis mediante Spring AI para la clasificación automatizada de solicitudes y generación de un dashboard visual de KPIs
.
- Respaldo Legal: Crear un repositorio digital inalterable ("Caja Fuerte") para el almacenamiento de evidencias fotográficas y documentos técnicos con registro de fecha y hora
.

**Stack Tecnológico**

El proyecto utiliza una arquitectura monolítica modular y es agnóstico a la nube mediante la contenerización:

- Frontend: React (JavaScript) para una interfaz web responsive
.
- Backend: Java con Spring Boot (API REST)
.
- Seguridad: Spring Security + JWT (JSON Web Tokens) para control de acceso por perfiles
.
- IA: Spring AI para procesamiento de lenguaje natural y categorización de urgencias
.
- Persistencia: Motores SQL (como PostgreSQL/MySQL en Supabase) y almacenamiento de objetos PaaS para multimedia
.
- Infraestructura: Docker para asegurar paridad entre entornos de desarrollo y producción
.

**Módulos del Sistema**

- Módulo Login: Autenticación segura y recuperación de contraseña
.
- Módulo Admin: Dashboard administrativo con gráficos, filtros de proyectos y edición de estados
.
- Módulo Reportes: Generación de métricas y exportación de datos a Excel/PDF
.
- Módulo Formulario: Generación automática de IDs, registro de fecha/hora y subida de fotos
.
- Módulo Cliente: Interfaz para seguimiento de tickets, adición de observaciones y encuestas de satisfacción
.
- Módulo Notificaciones: Envío automático de correos por cambios de estado y recordatorios de firma
.

**Metodología de Trabajo**

Se utiliza una Metodología Híbrida:

- Fase Predictiva (Cascada): Levantamiento estricto de requerimientos legales y diseño arquitectónico para asegurar la trazabilidad probatoria
.
- Fase Ágil (Scrum): Desarrollo iterativo e incremental del software dividido en 4 Sprints funcionales
.

**Equipo de Desarrollo:**

Integrante, Roles y Responsabilidades:
- Fabián Sanhueza: Líder de equipo, Desarrollo Frontend y Back end
.
- Romina Hormazábal: Arquitectura, Back end y QA/Testing
.
- Sofía Hormazábal: Administradora de Base de Datos (DBA), Analista Funcional y QA
.
