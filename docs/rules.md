# Reglas del Proyecto

> Reglas de negocio, de seguridad, límites técnicos y compliance. Léelo antes de implementar.

## Reglas de negocio

### RN-001: Cada empresa es un tenant aislado

- **Descripción:** Los datos de una empresa (usuarios, contextos por área, problemas, oportunidades) nunca son visibles para usuarios de otra empresa. El `companyId` es obligatorio en todas las entidades del sistema.
- **Aplicación:** Todos los módulos, todas las queries de base de datos, todos los API routes.
- **Validación:** Test de integración que verifica que un usuario de empresa A no puede leer datos de empresa B.

### RN-002: Roles de usuario son inmutables en MVP

- **Descripción:** El sistema tiene exactamente 3 roles:
  1. `superadmin` — Consultora. Puede ver todas las empresas, gestionar tenants, ver resúmenes consolidados.
  2. `company_admin` — Admin de la empresa. Puede invitar usuarios a su empresa, ver todos los contextos de su empresa, ver resumen ejecutivo.
  3. `company_user` — Usuario interno de la empresa. Puede completar contexto de áreas asignadas, ver solo sus propios datos y el resumen de su empresa.
- **Aplicación:** Módulos `auth`, `company`, `diagnostic`.
- **Validación:** Enum en TypeScript/Zod + middleware de autorización + tests.

### RN-003: Un usuario pertenece a exactamente una empresa

- **Descripción:** No se permite que un usuario pertenezca a múltiples empresas. Si una persona trabaja en dos empresas, necesita dos cuentas con emails distintos.
- **Aplicación:** Módulo `auth`, modelo de datos.
- **Validación:** Constraint único de DB en (`email`) + test.

### RN-004: Todo problema identificado requiere severidad

- **Descripción:** Cuando un usuario documenta un problema en un área, debe asignarle una severidad: `critical` (bloqueante), `high` (impacto alto), `medium` (mejora importante), `low` (oportunidad menor). No se permite guardar un problema sin severidad.
- **Aplicación:** Módulo `diagnostic`, formularios por área.
- **Validación:** Schema Zod + test unitario.

### RN-005: Las áreas de diagnóstico son un catálogo cerrado

- **Descripción:** El sistema tiene exactamente 8 áreas de diagnóstico. No se permite crear áreas dinámicas en MVP. Las áreas son:
  1. `general` — Perfil y datos generales
  2. `strategy` — Estrategia y modelo de negocio
  3. `operations` — Operaciones y procesos
  4. `finance` — Finanzas y control de gestión
  5. `technology` — Tecnología y sistemas
  6. `human-resources` — Recursos humanos y cultura
  7. `marketing-sales` — Marketing, ventas y experiencia de cliente
  8. `legal` — Legal y compliance
- **Aplicación:** Módulo `diagnostic`, UI de navegación por áreas, modelos de datos.
- **Validación:** Enum en TypeScript/Zod + tests unitarios.

### RN-006: Solo `company_admin` puede invitar usuarios

- **Descripción:** La gestión de usuarios dentro de una empresa (invitar, desactivar) es responsabilidad exclusiva del `company_admin`. Los `company_user` no pueden invitar a nadie.
- **Aplicación:** Módulo `company`, API routes de invitación.
- **Validación:** Middleware de autorización + tests de integración.

### RN-007: Superadmin accede a todas las empresas

- **Descripción:** El rol `superadmin` (consultora) tiene acceso de lectura a todos los tenants. Puede ver el dashboard de empresas, estado de completitud, y resúmenes ejecutivos. No puede modificar datos internos de una empresa (solo leer).
- **Aplicación:** Módulo `auth`, dashboard de consultora.
- **Validación:** Tests de integración + middleware.

## Reglas de seguridad

### SEG-001: Autenticación y autorización

- **Regla:** Auth obligatorio desde MVP. NextAuth.js con Credentials provider (email/password). JWT session.
- **Implementación:** `src/lib/auth.ts` + API routes protegidas con middleware.

### SEG-002: Multi-tenancy y aislamiento

- **Regla:** Toda query a base de datos debe incluir `companyId` del usuario autenticado (excepto `superadmin`).
- **Implementación:** Helper `withTenant(query, session)` que inyecta `companyId`. Revisión obligatoria en PR.

### SEG-003: Sanitización de inputs

- **Regla:** Todo input de usuario pasa por sanitización antes de renderizado (prevenir XSS). Next.js lo hace por defecto en JSX, pero cuidado con `dangerouslySetInnerHTML`.
- **Implementación:** Prohibido usar `dangerouslySetInnerHTML` sin sanitización explícita (DOMPurify).

### SEG-004: Datos sensibles

- **Regla:** No persistir secrets, API keys, ni credenciales en `localStorage`. Contraseñas hasheadas con bcrypt. Datos internos de empresa nunca loggeados en texto plano.
- **Implementación:** Revisión en PR + arch-check.

## Límites técnicos

- **Tiempo máximo de respuesta API:** 1s p95.
- **Tamaño máximo de payload:** 10MB (para futura subida de documentos).
- **Límites de rate:** 100 req/min por IP en endpoints de auth.
- **Compatibilidad:** Últimas 2 versiones de Chrome, Firefox, Edge.

## Compliance

- **Confidencialidad del cliente:** El diseño de DB debe permitir exportación completa de datos de un tenant si la empresa lo solicita.
- **Auditoría:** Agregar `createdAt` / `updatedAt` a todas las entidades. En MVP no hay `createdBy` (se agregará con auth completo).

## Reglas de código

- [ ] No commits directos a `main` o `develop`.
- [ ] Todo PR requiere al menos 1 aprobación humana.
- [ ] Toda feature nueva requiere test de aceptación (E2E si es flujo crítico).
- [ ] No se permite código sin tipo / sin tipado explícito. `noImplicitAny: true`.
- [ ] No importar desde `app/` en `modules/`. `modules/` es puro, `app/` es adaptador.
- [ ] Toda query de DB debe pasar por helper `withTenant` o equivalente.

---

*Actualizar este documento cuando cambien las reglas. El CDM detectará automáticamente si se modifican archivos relacionados.*
