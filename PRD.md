# PRD — Plataforma de Diagnóstico Empresarial (SaaS)

## Problema

Las empresas no tienen una forma estructurada de documentar su propio contexto interno: qué problemas tiene cada área, qué procesos siguen, qué herramientas usan, dónde les duele. Cuando una consultora llega, pierde semanas en discovery porque la información vive en la cabeza de empleados dispersos.

Como consultora, necesitamos que el **cliente mismo** se registre en una plataforma, invite a su equipo, y cada colaborador documente el contexto de su área. Nosotros accedemos a esa información consolidada para analizar, diagnosticar, y proponer soluciones.

**Flujo ideal:**
1. Empresa se registra en la plataforma → crea su cuenta (tenant).
2. Admin de la empresa invita a usuarios de su equipo.
3. Cada usuario completa el contexto de su área/departamento.
4. Consultora accede a la info consolidada → analiza → genera propuesta.

## Usuario afectado

**Usuario primario (empresa):**
- Admin de la empresa que registra el tenant e invita al equipo.
- Empleados de diferentes áreas que documentan su contexto operativo.

**Usuario secundario (consultora):**
- Consultor/superadmin que accede a múltiples empresas para hacer diagnóstico y proponer soluciones.

**Contexto actual:**
- La empresa no tiene un repositorio centralizado de su contexto.
- Cada área tiene sus propias herramientas y nadie tiene visión global.
- La consultora hace entrevistas 1:1 con cada área, toma notas sueltas, y luego debe consolidar manualmente.

## Éxito

- Una empresa puede registrarse y empezar a usar la plataforma en < 5 minutos.
- Un usuario interno puede completar el contexto de su área en < 15 minutos.
- La consultora puede ver un dashboard consolidado de la empresa con todos los contextos por área.
- Tiempo de discovery reducido de semanas a días.
- El sistema previene que usuarios de empresa A vean datos de empresa B (aislamiento total).

## Restricciones

- **Tecnología:** Next.js 16, TypeScript, Tailwind CSS, NextAuth.js (auth), SQLite local en MVP.
- **Tiempo:** MVP funcional en 4-5 sesiones.
- **Negocio:** Multi-tenancy obligatorio desde el inicio. Cada empresa es un tenant aislado.
- **Legal:** Datos internos de la empresa son confidenciales. Aislamiento estricto por tenant.

## Alternativas descartadas

1. **Hacer la consultora quien registra todo:** Descartado porque escala mal. El consultor se convierte en cuello de botella. La información es más rica cuando viene de quien vive el problema.
2. **Usar Notion/Airtable compartido:** Descartado porque no permite aislamiento estricto por empresa (multi-tenancy), ni roles diferenciados (consultor vs admin de empresa vs empleado), ni generación automática de resumen para la consultora.
3. **Crear app móvil nativa:** Descartado. La plataforma es web-first. Mobile responsive, pero no nativo en MVP.

## Alcance propuesto (MVP)

**Dentro:**
- Registro de empresa (creación de tenant).
- Auth: login/register con email/password. NextAuth.js con Credentials provider.
- Roles de usuario: `superadmin` (consultora), `company_admin` (empresa), `company_user` (empresa).
- Gestión de usuarios por parte del `company_admin` (invitar, desactivar).
- Discovery estructurado por **áreas empresariales** (8 áreas). Cada usuario completa las áreas relevantes a su rol.
- Cada área permite documentar: datos clave, problemas identificados (con severidad), oportunidades, y notas libres.
- Vista de resumen ejecutivo consolidado por empresa (visible para `company_admin` y `superadmin`).
- Dashboard de consultora: listado de empresas registradas, estado de completitud por empresa.
- Soft delete de empresas y usuarios.
- Validación de campos con Zod.
- Tests unitarios de dominio + E2E de flujos críticos.

**Fuera (post-MVP):**
- OAuth / SSO empresarial.
- Scoring automático de madurez por área.
- Comparativa contra benchmarks de industria.
- Generación automática de propuesta comercial desde diagnóstico.
- Adjuntar documentos/evidencia por área.
- Timeline de hallazgos.
- Notificaciones por email.
- Exportar a PDF / Word con branding.
- API pública para integraciones.

---

*PRD generado en sesión inicial. Requiere validación humana antes de pasar a Capa 2 (Traducción) y Capa 3 (Ejecución).*
