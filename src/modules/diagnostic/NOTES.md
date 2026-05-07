# NOTES.md — Módulo: Diagnostic

> Conocimiento táctico del módulo `diagnostic`. Decisiones, deuda técnica, patrones.

## Responsabilidad

Gestión del **contexto por áreas empresariales**. Cada usuario interno documenta el contexto de las áreas relevantes a su rol/departamento.

Un caso de diagnóstico pertenece a una empresa. Las áreas son un catálogo cerrado de 8 elementos.

## Decisiones tácticas

- **Un caso de diagnóstico por empresa en MVP:** Cada empresa tiene un único caso de diagnóstico activo. Post-MVP se podrían tener múltiples (ej: diagnóstico anual).
- **Catálogo cerrado de áreas:** Las 8 áreas son fijas. Cada área tiene un conjunto de campos estructurados (preguntas clave) + campos libres (problemas, oportunidades, notas).
- **Severidad obligatoria:** Todo problema debe tener `critical`, `high`, `medium`, o `low`.
- **Resumen ejecutivo:** Agrega problemas por área, ordenados por severidad. Visible para `company_admin`, `company_user`, y `superadmin`.
- **Consultora ve todo:** El `superadmin` tiene acceso de lectura al diagnóstico de cualquier empresa.

## Deuda técnica

- **Sin asignación de áreas por rol:** En MVP cualquier usuario puede completar cualquier área. Post-MVP: asignar áreas específicas a usuarios.
- **Sin documentos adjuntos:** Solo texto en MVP. Post-MVP: subida de archivos/evidencia por área.
- **Sin notificaciones por email:** No hay alertas cuando alguien completa un área o hay problemas críticos.
- **Sin historial de versiones (diff):** Audit log guarda quién editó y cuándo, pero no qué cambió exactamente.
- **NextAuth v4 deprecated middleware:** Console warning sobre `middleware` → `proxy`. Post-MVP: migrar cuando Next.js estabilice.

## Patrones implementados

- **Scoring por severidad (F4):** Score por área = 100 - suma de penalizaciones. critical(-25), high(-15), medium(-8), low(-3). Floor en 0. Overall score = promedio de áreas completadas.
- **Exportación de informes (F5):** `generateDiagnosticReport` retorna informe completo (JSON). Vista HTML imprimible en `/dashboard/report` con branding de empresa.
- **Audit automático en Server Actions (F6):** `saveAreaContextAction` inserta audit row tras cada guardado. El dominio (`saveAreaContext`) permanece puro; los side effects viven en el adaptador (Server Action).
- **`saveAreaContext` retorna `areaContextId` + `action`:** Facilita downstream operations (audit log) sin re-query.

## Dependencias internas

- Depende de `company` (todo diagnóstico pertenece a un tenant).
- Depende de `auth` (para verificar que el usuario tiene acceso al `companyId`).
- Depende de `src/lib/db` para persistencia.

## Testing

- Tests unitarios: `diagnostic.service.test.ts` — validación de áreas, severidad, resumen ejecutivo.
- Tests E2E: `tests/e2e/diagnostic-flow.spec.ts` — login → completar área → ver resumen.

## Reglas locales

1. Todo diagnóstico tiene `companyId`. Sin excepciones.
2. Las áreas son inmutables en MVP.
3. Todo problema tiene severidad.
4. El resumen ejecutivo filtra por `companyId` del usuario (excepto `superadmin`).

---

*Última revisión: sesión F6. Servicio `diagnostic.service` incluye scoring, generación de informes, auditoría y timeline. Tests unitarios (15) y E2E (9) pasando. CDM verificado.*
