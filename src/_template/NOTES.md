# NOTES.md — Conocimiento Táctico del Módulo

> Decisiones, patrones y deuda técnica específicas de este módulo.
> Este es un ejemplo. Crea un `NOTES.md` dentro de cada módulo en `src/`.

## Propósito del módulo

> Una oración que describa qué problema del dominio resuelve este módulo.

## Decisiones de diseño

> Decisiones tácticas tomadas durante el desarrollo. Incluye el "por qué".

- **Decisión:** _(qué se decidió)_ → **Razón:** _(por qué)_ → **Fecha:** _(cuándo)_

## Patrones usados

> Patrones de código o arquitectura aplicados en este módulo.

- _(ej: Repository pattern para acceso a datos)_
- _(ej: Strategy pattern para cálculo de impuestos)_

## Dependencias internas

> Qué otros módulos del proyecto utiliza este módulo y cómo.

| Módulo | Interfaz usada | Notas |
|---|---|---|
| _(nombre)_ | _(clase/funcción/endpoint)_ | _(por qué se usa)_ |

## Deuda técnica

> Lo que se dejó pendiente con justificación.

| Descripción | Impacto | Plan de mitigación | Fecha límite |
|---|---|---|---|
| _(descripción)_ | _(bajo/medio/alto)_ | _(cómo se resolverá)_ | _(cuándo)_ |

## APIs públicas

> Si este módulo expone una API (REST, gRPC, funciones, etc.), documenta los endpoints o métodos principales.

| Endpoint / Método | Propósito | Notas |
|---|---|---|
| `POST /api/v1/...` | _(qué hace)_ | _(consideraciones)_ |

## Notas para el agente

> Cualquier cosa que un agente deba saber antes de modificar este módulo.

- _(ej: No usar el método X directamente; siempre pasar por Y)_
- _(ej: Este módulo usa lógica síncrona intencionalmente por requisito Z)_

---

*Mantenido por el dev responsable del módulo. Actualizar tras cada sesión si hay cambios significativos.*
