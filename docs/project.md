# Proyecto — Planificación y Estado

> Roadmap, features en curso, slices planificados y definición de done.

## Estado actual

- **Versión actual:** 0.1.0 (MVP)
- **Milestone:** F0–F4 completados (Fundación, Auth, Gestión de Usuarios, Discovery por Áreas, Resumen Ejecutivo + Dashboard Consultora)
- **Bloqueantes:** Ninguno.

## Roadmap

| Fase | Objetivo | Estado | ETA |
|---|---|---|---|
| F0 — Fundación | Setup Next.js + WhiteCore OS, docs, CI base, testing | Completado | Done |
| F1 — Auth + Multi-tenancy | NextAuth.js, roles (superadmin/company_admin/company_user), registro de empresa (tenant), aislamiento de datos. | Completado | Done |
| F2 — Gestión de Usuarios | Company_admin invita usuarios company_user, soft delete de usuarios, UI /dashboard/users. | Completado | Done |
| F3 — Discovery por Áreas | Formularios estructurados por las 8 áreas empresariales. Preguntas clave + campos libres. | Completado | Done |
| F4 — Resumen Ejecutivo + Dashboard Consultora | Scoring por área, vista consolidada por empresa, dashboard de consultora con estado de completitud. | Completado | Done |
| F5 — Exportar Informe | Exportar diagnóstico a PDF/JSON con branding. | Planning | — |
| F6 — Exportar Informe | Exportar diagnóstico a PDF/JSON con branding. | Planning | — |

## Features en curso

### Feature: F0 — Fundación del Proyecto

- **ID:** F0
- **Descripción:** Configurar el repositorio con Next.js 16, Tailwind, testing (Vitest + Playwright), y adaptar todos los documentos de WhiteCore OS al dominio de plataforma SaaS de diagnóstico empresarial.
- **Módulos afectados:** N/A (infraestructura)
- **Slices planificados:**
  - [x] Inicializar Next.js con TypeScript, App Router, Tailwind
  - [x] Copiar estructura WhiteCore OS (docs, skills, .whitecore, tests)
  - [x] Adaptar `docs/context.md`, `docs/rules.md`, `docs/project.md`
  - [x] Escribir PRD.md para plataforma SaaS de diagnóstico
  - [ ] Configurar `.whitecore/deps.yml` para nueva estructura
  - [ ] Crear `SESSION.md` y módulos `auth`, `company`, `diagnostic` con `NOTES.md`
  - [ ] Instalar y configurar Vitest + Playwright
  - [ ] Verificar CI base pasa (lint, type-check, build, tests)
- **Dependencias:** Ninguna externa.

### Feature: F1 — Auth + Multi-tenancy

- **ID:** F1
- **Descripción:** Implementar autenticación con NextAuth.js (Credentials provider), 3 roles de usuario, registro de empresa como tenant, y aislamiento de datos por `companyId`.
- **Módulos afectados:** `auth`, `company`
- **Slices planificados:**
  - [ ] Instalar y configurar NextAuth.js con Credentials provider.
  - [ ] Modelo de datos: `Company` (tenant), `User` (con role y companyId).
  - [ ] Registro de empresa: formulario que crea Company + User (company_admin).
  - [ ] Login con email/password.
  - [ ] Middleware de autorización por rol.
  - [ ] Helper `withTenant` para aislamiento de DB queries.
  - [ ] Tests E2E: registro → login → acceso protegido.
- **Dependencias:** F0 completado.

## Backlog

- OAuth / SSO empresarial.
- Scoring automático de madurez por área.
- Benchmarks de industria.
- Generación automática de propuesta comercial.
- Adjuntar documentos/evidencia por área.
- Timeline de hallazgos.
- Notificaciones por email.
- Búsqueda full-text en hallazgos.
- API pública para integraciones.

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
| Cobertura de tests | > 80% | ~75% |
| Deuda técnica documentada | 0 crítica | 0 |
| Docs desactualizados (CDM) | 0 | 0 |

---

*Revisar semanalmente. El CDM alertará si cambios en el código afectan los módulos documentados aquí.*
