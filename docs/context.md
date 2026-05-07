# Contexto del Proyecto

> Stack, decisiones de arquitectura y convenciones específicas de **Plataforma de Diagnóstico Empresarial** (SaaS para consultora).

## Dominio

Este proyecto es una **plataforma SaaS de diagnóstico empresarial**. No es un CRM ni una herramienta interna. Su propósito es:

1. Permitir que una **empresa se registre** como tenant y gestione sus propios usuarios.
2. Que cada **usuario interno** documente el contexto de su área/departamento.
3. Que la **consultora** acceda a la información consolidada de múltiples empresas para analizar, diagnosticar, y proponer soluciones.

**Flujo principal:**
```
Empresa se registra (crea tenant)
  → Admin de empresa invita usuarios
  → Usuarios completan contexto por áreas
  → Consultora analiza resumen consolidado
  → Consultora propone soluciones
```

## Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Lenguaje | TypeScript | ^5 | Tipado estático, ecosistema Next.js |
| Runtime | Node.js | >=18 | Requerido por Next.js 16 |
| Framework | Next.js (App Router) | 16.2.5 | SSR/SSG, routing declarativo, API routes, middleware |
| Estilos | Tailwind CSS | ^4 | Utility-first, sin CSS modules por defecto |
| Validación | Zod | ^3 | Schemas compartidos entre frontend y API routes |
| Auth | NextAuth.js | ^5 | Credentials provider (email/password), JWT sessions |
| Testing Unit | Vitest | ^3 | Rápido, nativo ESM, compatible con React Testing Library |
| Testing E2E | Playwright | ^1.40 | Tests críticos de flujo de usuario |
| CI/CD | GitHub Actions | — | Hardness Medium: lint → type-check → arch-check → tests → build |
| Infraestructura | Vercel (propuesta) | — | Deploy automático desde main/develop |

## Decisiones de arquitectura

### ADR-001: Next.js App Router + Server Components por defecto

- **Contexto:** Necesitamos una app web moderna con buen rendimiento para formularios extensos de diagnóstico y dashboards.
- **Decisión:** Usar App Router de Next.js 16. Server Components por defecto, Client Components solo para interacción de formularios y auth.
- **Consecuencias:** + Menos JS al cliente, + Mejor rendimiento en formularios largos, + Streaming. − Curva de aprendizaje si el equipo viene de Pages Router.

### ADR-002: Modularización por dominio

- **Contexto:** El sistema tiene dominios claros: auth, company (tenant), diagnostic (contexto por áreas), user management.
- **Decisión:** Organizar `src/` por módulos de dominio. Cada módulo tiene su `NOTES.md`.
- **Consecuencias:** + Cada módulo es cohesivo. − Posible duplicación leve de UI si no se extraen componentes compartidos.

### ADR-003: Multi-tenancy con companyId obligatorio

- **Contexto:** Cada empresa es un tenant. El aislamiento de datos es crítico.
- **Decisión:** Todas las entidades del sistema (excepto `Company` y `User` en su tabla base) llevan `companyId`. Las queries de DB siempre filtran por `companyId` del usuario autenticado.
- **Consecuencias:** + Aislamiento robusto. − Queries siempre necesitan `companyId`. Se mitiga con helper `withTenant`.

### ADR-004: Auth con NextAuth.js Credentials provider

- **Contexto:** Necesitamos auth desde MVP. OAuth es overkill para el primer release.
- **Decisión:** NextAuth.js v5 (Auth.js) con Credentials provider. JWT sessions. Password hasheados con bcrypt.
- **Consecuencias:** + Rápido de implementar. + Sin dependencia de proveedores externos. − Sin SSO/OAuth en MVP.

### ADR-005: Almacenamiento local inicial (SQLite)

- **Contexto:** En fase MVP no hay backend dedicado.
- **Decisión:** SQLite local para desarrollo. Migración a PostgreSQL planificada cuando se necesite concurrencia real.
- **Consecuencias:** + Sin dependencia de servicios externos. − No escalable a múltiples instancias. Solo para MVP.

## Convenciones del proyecto

- **Estructura de carpetas:**
  ```
  src/
    app/              # Rutas y layouts (Next.js App Router)
    modules/
      auth/           # Dominio: autenticación, roles, sesiones
      company/        # Dominio: tenant/empresa
      user/           # Dominio: gestión de usuarios dentro de empresa
      diagnostic/     # Dominio: caso de diagnóstico y áreas
        areas/        # Sub-módulos por área empresarial
      shared/         # Componentes, hooks, utils transversales
    lib/              # Configuración de terceros (db, auth, api clients)
  ```
- **Estilo de código:** ESLint (config-next) + Prettier (opcional). Regla: no any implícito.
- **Commits:** Conventional Commits. `feat(module): descripción`, `fix(module): descripción`.
- **Branches:** `feat/{id}`, `fix/{id}`, `hotfix/{id}`. Todo pasa por PR a `develop`.

## Dependencias externas clave

| Paquete / Servicio | Propósito | Notas |
|---|---|---|
| `next` | Framework full-stack | App Router, API routes, Server Actions, middleware |
| `tailwindcss` | Estilos | v4 con PostCSS. No usar `@apply` excesivamente. |
| `zod` | Validación | Schemas compartidos entre frontend y API routes |
| `next-auth` | Autenticación | v5 (Auth.js). Credentials provider + JWT. |
| `bcrypt` | Hash de passwords | Nunca almacenar passwords en texto plano. |
| `vitest` | Tests unitarios | Con `@testing-library/react` para componentes |
| `playwright` | Tests E2E | Solo flujos críticos: registro empresa, login, completar área, ver resumen |

## Variables de entorno requeridas

| Variable | Descripción | Ambiente |
|---|---|---|
| `DATABASE_URL` | Path a SQLite (ej: `file:./local.db`) | Local / Dev |
| `NEXTAUTH_SECRET` | Secret para firmar JWT sessions | Todos |
| `NEXTAUTH_URL` | URL base de la app (ej: `http://localhost:3000`) | Local / Dev |
| `NEXT_PUBLIC_APP_NAME` | Nombre visible de la app | Todos |

## Testing

### Niveles de testing

| Nivel | Framework | Qué se testea | Dónde vive |
|---|---|---|---|
| Unitario | Vitest + React Testing Library | Dominio (validaciones, scoring, estados, auth) y componentes. | `src/**/*.test.{ts,tsx}` o `tests/unit/**` |
| Integración | Vitest + API routes | Adaptadores, DB, API routes de Next.js, middleware de auth. | `tests/integration/**` |
| E2E | **Playwright** | Flujos críticos: registro empresa, login, invitar usuario, completar área, ver resumen. | `tests/e2e/**` |

### Playwright (E2E)

- **Configuración:** `playwright.config.ts`
- **Base URL:** `http://localhost:3000`
- **Navegadores:** Chromium (Desktop Chrome)
- **Selectores recomendados:** roles ARIA, `data-testid`, texto visible.
- **Evitar:** selectores CSS frágiles.

### Configuración de Vitest

- **File parallelism desactivado:** `fileParallelism: false` + `pool: 'forks'` para evitar conflictos de SQLite compartida entre archivos de test.
- **Tests unitarios de dominio:** Se limpia la DB en `beforeEach` con `PRAGMA foreign_keys = OFF` para permitir borrado limpio.

### Cobertura mínima

- **Unitarios:** > 80% de lógica de dominio (validaciones, scoring, estados, auth).
- **Integración:** Todo adaptador que toque DB o API externa. Todo middleware de auth.
- **E2E:** Solo flujos críticos definidos en el PRD.

## Notas especiales

- **Multi-tenancy desde el día 1:** No es un add-on. Es la base del sistema.
- **Sin backend externo en MVP:** toda la lógica de persistencia vive en API routes de Next.js + SQLite.
- **Server Actions:** preferir Server Actions sobre API routes manuales para mutaciones simples.
- **Áreas del diagnóstico:** El catálogo de 8 áreas es cerrado en MVP. No configurable.
- **Auth:** NextAuth.js v4 (v5 beta no era estable con Next.js 16). El callback `session` debe incluir `companyId` y `role`.
- **Middleware:** `src/middleware.ts` usa `withAuth` de NextAuth v4 con `secret` explícito para compatibilidad con edge runtime.

---

*Revisado: sesión F6. Stack actualizado: NextAuth.js v4 estable, middleware con secret explícito para evitar error de configuración en dev. El CDM detectará cambios automáticamente.*
