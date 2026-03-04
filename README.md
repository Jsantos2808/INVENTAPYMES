# InventarioPYME — Sistema de Control de Inventario para Pequeñas y Medianas Empresas

> Aplicación web para que PYMES lleven un control preciso de su inventario en tiempo real, registren movimientos de productos, reciban alertas de stock crítico y generen reportes de valorización sin depender de hojas de cálculo.

---

## Problema

Las pequeñas y medianas empresas (tiendas, ferreterías, distribuidoras, minisupers) controlan su inventario con hojas de Excel o cuadernos físicos. Esta práctica genera quiebres de stock no detectados, discrepancias entre el inventario físico y el registrado, pérdidas no trazables y decisiones de reabastecimiento basadas en intuición en vez de datos reales.

## Solución

**InventarioPYME** es un panel web accesible desde cualquier dispositivo donde el equipo puede registrar entradas y salidas de productos, configurar niveles de stock mínimo, recibir alertas automáticas por email y exportar reportes de valorización para contabilidad.

## Stakeholders

| Rol | Interés principal |
|-----|------------------|
| Dueño / Gerente de PYME | Visibilidad total del inventario y reportes para decisiones de compra |
| Encargado de bodega | Registrar entradas y salidas de manera rápida y sin errores |
| Encargado de compras | Saber qué productos están en nivel crítico y cuánto reabastecer |
| Contador (externo) | Exportar reporte de valorización para estados financieros |

## Stack tecnológico (propuesto)

- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL
- **Notificaciones:** SendGrid (email)
- **Exportación:** SheetJS (Excel) + jsPDF (PDF)

## Estructura del repositorio

```
/
├── README.md
└── docs/
    ├── system-brief.md     # Visión, alcance y diagrama de contexto (Mermaid)
    └── requirements.md     # Backlog, historias de usuario y MVP rationale
```
