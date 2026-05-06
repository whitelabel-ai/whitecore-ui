# Contexto del Proyecto

> Stack, decisiones de arquitectura y convenciones específicas de este proyecto.

## Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Lenguaje | _(ej: TypeScript, Python, Go)_ | _(versión)_ | _(por qué)_ |
| Runtime | _(ej: Node.js, Deno, JVM)_ | _(versión)_ | _(por qué)_ |
| Framework | _(ej: NestJS, FastAPI, Gin)_ | _(versión)_ | _(por qué)_ |
| Base de datos | _(ej: PostgreSQL, MongoDB)_ | _(versión)_ | _(por qué)_ |
| ORM / Cliente DB | _(ej: Prisma, SQLAlchemy)_ | _(versión)_ | _(por qué)_ |
| Testing | _(ej: Jest, Pytest, Go test)_ | _(versión)_ | _(por qué)_ |
| CI/CD | _(ej: GitHub Actions, GitLab CI)_ | — | _(por qué)_ |
| Infraestructura | _(ej: Docker, AWS, Vercel)_ | — | _(por qué)_ |

## Decisiones de arquitectura

> Decisiones importantes que definen cómo está estructurado el sistema.
> Usa el formato ADR-lite: Contexto → Decisión → Consecuencias.

### ADR-001: _(título de la decisión)_

- **Contexto:** _¿Qué problema resolvíamos?_
- **Decisión:** _¿Qué elegimos?_
- **Consecuencias:** _¿Qué ganamos? ¿Qué sacrificamos?_

## Convenciones del proyecto

- **Estructura de carpetas:** _cómo se organiza src/_
- **Estilo de código:** _linter, formatter, reglas especiales_
- **Commits:** _formato (ej: conventional commits)_
- **Branches:** _naming (feat/, fix/, hotfix/)_

## Dependencias externas clave

| Paquete / Servicio | Propósito | Notas |
|---|---|---|
| _(nombre)_ | _(para qué se usa)_ | _(limitaciones o consideraciones)_ |

## Variables de entorno requeridas

| Variable | Descripción | Ambiente |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | Todos |
| _(otra)_ | _(descripción)_ | _(ambiente)_ |

## Testing

> Frameworks, herramientas y políticas de testing por nivel.

### Niveles de testing

| Nivel | Framework | Qué se testea | Dónde vive |
|---|---|---|---|
| Unitario | _(ej: Jest, Vitest, Mocha)_ | Dominio y aplicación. Sin mocks de infraestructura. | `tests/unit/**` |
| Integración | _(ej: Jest + testcontainers, Supertest)_ | Adaptadores, repositorios, APIs externas. | `tests/integration/**` |
| E2E | **Playwright** | Flujos críticos del usuario. | `tests/e2e/**` |

### Playwright (E2E)

- **Configuración:** `playwright.config.ts`
- **Base URL:** `http://localhost:3000` (ajustar si tu app usa otro puerto)
- **Navegadores:** Chromium, Firefox, WebKit
- **Selectores recomendados:** roles ARIA (`getByRole`), `data-testid` (`getByTestId`), texto visible.
- **Evitar:** selectores CSS frágiles (clases auto-generadas, estructura DOM profunda).

### Cobertura mínima

- **Unitarios:** > 80% de lógica de dominio.
- **Integración:** Todo adaptador que toque infraestructura real (DB, API externa).
- **E2E:** Solo flujos críticos definidos en el PRD. No más.

## Notas especiales

> Cualquier consideración adicional que un agente o dev nuevo deba saber antes de tocar código.
