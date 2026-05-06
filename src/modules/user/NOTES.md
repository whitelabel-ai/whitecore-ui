# NOTES.md — Módulo: User

> Conocimiento táctico del módulo `user`. Decisiones, deuda técnica, patrones.

## Responsabilidad

Gestión de usuarios **dentro de una empresa**. Invitaciones, perfiles, activación/desactivación.

Un usuario siempre pertenece a exactamente una empresa (`companyId`). No hay usuarios "huérfanos" ni multi-empresa.

## Decisiones tácticas

- **Solo company_admin puede invitar:** El endpoint de invitación verifica que el requester tenga rol `company_admin`.
- **Invitación simple en MVP:** El admin crea el usuario directamente (nombre, email, rol). El usuario recibe sus credenciales y hace login. No hay "email de invitación" en MVP.
- **company_user puede ver resumen:** Aunque registra su propio contexto, también puede ver el resumen ejecutivo consolidado de su empresa.
- **Tests secuenciales:** Se configura `vitest.config.ts` con `fileParallelism: false` y `pool: 'forks'` para evitar conflictos de SQLite compartida entre tests unitarios.

## Deuda técnica

- **Sin email de invitación:** El admin debe comunicar las credenciales por otro canal (WhatsApp, email manual).
- **Sin cambio de empresa:** Un usuario no puede transferirse a otra empresa. Debe crearse una cuenta nueva.
- **Sin avatar/foto de perfil:** En MVP solo nombre y email.

## Dependencias internas

- Depende de `auth` para hashear passwords de usuarios invitados.
- Depende de `company` para validar que la empresa existe y está activa.
- Depende de `src/lib/db` para persistencia.

## Testing

- Tests unitarios: `user.service.test.ts` — invitación, validación de rol, soft delete.
- Tests de integración: `user.routes.test.ts` — protección de endpoints, filtro por companyId.
- Tests E2E: `tests/e2e/user-management.spec.ts` — admin invita usuario → nuevo usuario hace login.

## Reglas locales

1. Un usuario solo puede invitar a otros de su misma empresa (mismo `companyId`).
2. El `company_admin` no puede cambiar su propio rol ni eliminarse a sí mismo (debe haber siempre al menos un admin).
3. El email es único en todo el sistema (no solo dentro de la empresa).
