# BriefFlow — Sistema de Elaboración de System Briefs para Equipos de Software

> Plataforma web colaborativa que guía a equipos de producto en la creación, validación y versionado de System Briefs estandarizados, reduciendo el tiempo de arranque de proyectos y las ambigüedades en el alcance.

---

## Problema

Los equipos de desarrollo arrancan proyectos sin una visión documentada y compartida. El System Brief —el documento que define el problema, stakeholders, scope y no-scope— se elabora de forma informal, en distintos formatos, sin validación de stakeholders y sin historial de cambios. Esto genera malentendidos de alcance, retrabajo costoso y proyectos que resuelven el problema equivocado.

## Solución

**BriefFlow** es una herramienta web que provee plantillas estructuradas de System Brief, flujos de aprobación por stakeholders, historial de versiones y exportación a Markdown/PDF listos para GitHub, todo en un entorno colaborativo en tiempo real.

## Stakeholders

| Rol | Interés principal |
|-----|------------------|
| Product Manager / Owner | Crear y versionar el System Brief del proyecto |
| Tech Lead / Arquitecto | Validar scope técnico y restricciones del sistema |
| Stakeholder de negocio | Aprobar el brief y confirmar que resuelve el problema correcto |
| Desarrollador | Consultar el brief actualizado como referencia de alcance |

## Stack tecnológico (propuesto)

- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL
- **Colaboración en tiempo real:** WebSockets (Socket.io)
- **Exportación:** jsPDF / remark (Markdown)
- **Autenticación:** OAuth 2.0 (Google / GitHub)

## Estructura del repositorio

```
/
├── README.md
└── docs/
    ├── system-brief.md     # Visión, alcance y diagrama de contexto Mermaid
    └── requirements.md     # Backlog completo + GWT + MVP rationale
```

## Links

- 📋 **Backlog (Trello):** https://trello.com/invite/b/69a79f46e1fc62b15e2d0254/ATTI32c04fb51686c553a23c3ffb2be2d8c5C54331E1/inventapyme
- 🎬 **Video explicativo:** [Google Drive →](https://drive.google.com/TU_ENLACE)
