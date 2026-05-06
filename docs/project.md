# Proyecto — Planificación y Estado

> Roadmap, features en curso, slices planificados y definición de done.

## Estado actual

> Resumen ejecutivo del proyecto en este momento.

- **Versión actual:** _(ej: 0.3.0)_
- **Sprint / Milestone:** _(nombre o número)_
- **Bloqueantes:** _(lista de impedimentos activos)_

## Roadmap

| Fase | Objetivo | Estado | ETA |
|---|---|---|---|
| _(nombre)_ | _(descripción)_ | _(planning / in-progress / done)_ | _(fecha)_ |

## Features en curso

### Feature: _(nombre)_

- **ID:** _(identificador único)_
- **Descripción:** _qué hace_
- **Módulos afectados:** _lista de módulos_
- **Slices planificados:**
  - [ ] _(slice 1: entregable pequeño)_
  - [ ] _(slice 2)_
- **Dependencias:** _features o sistemas externos de los que depende_

## Backlog

> Ideas y features futuras no priorizadas.

- _(idea 1)_
- _(idea 2)_

## Definición de Done

> Un feature o slice no está terminado hasta cumplir:

- [ ] Código implementado y revisado.
- [ ] Tests unitarios cubren la lógica de dominio.
- [ ] Tests de integración cubren los adaptadores.
- [ ] Tests E2E cubren el flujo crítico de la feature (si aplica).
- [ ] Documentación actualizada (`context.md`, `rules.md`, `NOTES.md` si aplica).
- [ ] CI pasa (lint, type-check, arch-check, tests, context-freshness).
- [ ] Aprobación humana en PR.

## Métricas de salud del proyecto

| Métrica | Valor objetivo | Actual |
|---|---|---|
| Cobertura de tests | > 80% | _(valor)_ |
| Deuda técnica documentada | 0 crítica | _(cantidad)_ |
| Docs desactualizados (CDM) | 0 | _(cantidad)_ |

---

*Revisar semanalmente. El CDM alertará si cambios en el código afectan los módulos documentados aquí.*
