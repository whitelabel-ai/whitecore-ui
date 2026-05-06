# NOTES.md — Módulo: Auth

> Conocimiento táctico del módulo `auth`. Decisiones, deuda técnica, patrones.

## Responsabilidad

Gestión de autenticación, autorización, sesiones, y roles de usuario. Es la base del sistema porque sin auth no hay multi-tenancy.

## Decisiones tácticas

- **NextAuth.js v5 (Auth.js):** Usamos el Credentials provider con email/password. JWT sessions. El token JWT incluye `userId`, `companyId`, y `role` para que tanto frontend como backend conozcan el contexto del usuario sin hacer query extra.
- **bcrypt para passwords:** Passwords hasheados con bcrypt (cost factor 10). Nunca en texto plano.
- **3 roles fijos:** `superadmin`, `company_admin`, `company_user`. No hay roles dinámicos en MVP.
- **Middleware de Next.js:** Usamos `middleware.ts` en la raíz de `app/` para proteger rutas según rol.

## Deuda técnica

- **OAuth/SSO:** No hay login con Google, Microsoft, etc. en MVP. Solo email/password.
- **Recuperación de password:** No implementada en MVP. Si un usuario olvida su password, debe contactar al admin.
- **2FA:** No implementada.
- **Rate limiting:** Básico en endpoints de auth (100 req/min por IP). Mejorar con Redis en producción.

## Dependencias internas

- Depende de `src/lib/db` para verificar credenciales.
- Depende de `company` para validar que el `companyId` del usuario existe y está activo.
- No tiene dependencias circulares.

## Testing

- Tests unitarios: `auth.service.test.ts` — hash/compare de passwords, validación de credenciales.
- Tests de integración: `auth.routes.test.ts` — login, registro, session, middleware.
- Tests E2E: `tests/e2e/auth-flow.spec.ts` — registro empresa → login → acceso a dashboard.

## Reglas locales

1. Todo token JWT debe incluir `companyId` y `role`.
2. El `superadmin` no tiene `companyId` (o tiene `companyId: null`). Puede acceder a todas las empresas.
3. Nunca devolver el password hash al frontend.
4. Las rutas protegidas redirigen a `/login` si no hay sesión.
