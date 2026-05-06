# NOTES.md — Módulo: Company

> Conocimiento táctico del módulo `company`. Decisiones, deuda técnica, patrones.

## Responsabilidad

Gestión del **tenant/empresa**. Registro de empresa, datos del perfil de tenant, y relación con usuarios y diagnósticos.

Cada empresa es un tenant aislado. El `companyId` es la clave de aislamiento de todo el sistema.

## Decisiones tácticas

- **Registro de empresa crea tenant + admin:** Cuando una empresa se registra, se crea simultáneamente el registro `Company` y el primer `User` con rol `company_admin`.
- **Campos del tenant:** `name`, `industry`, `size`, `country`, `taxId` (opcional en registro, requerido para diagnóstico completo).
- **Soft delete:** Las empresas eliminadas se marcan con `deletedAt`. Sus usuarios y datos se marcan en cascada.

## Deuda técnica

- **Sin branding por tenant:** En MVP no hay personalización de logo/colores por empresa.
- **Sin dominio personalizado:** Todas las empresas usan la misma URL. Subdominios post-MVP.

## Dependencias internas

- Depende de `auth` para crear el primer usuario (company_admin) durante el registro.
- Depende de `src/lib/db` para persistencia.
- Es padre de `user` y `diagnostic` (unidireccional).

## Testing

- Tests unitarios: `company.service.test.ts` — creación de tenant, validación de campos.
- Tests E2E: `tests/e2e/company-registration.spec.ts` — flujo de registro completo.

## Reglas locales

1. `name` de empresa es obligatorio y único en el sistema.
2. El registro de empresa es el único flujo que crea `Company` + `User` en una transacción.
3. No se permite eliminar físicamente una empresa con usuarios activos.
