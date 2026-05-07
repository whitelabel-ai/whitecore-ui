# BRAIN.md — Patrones Globales de Arquitectura

> Conocimiento global que trasciende cualquier proyecto. Lo mejor de cada proyecto sube aquí.

## Principios de Arquitectura

### 1. Separación de responsabilidades por capas

Cualquier sistema debe poder dibujarse en capas horizontales donde cada capa solo depende de la inmediatamente inferior.

```
Presentation / API → Application → Domain → Infrastructure
```

- **Presentation / API**: Adaptadores de entrada. Controladores, handlers, CLI, UI.
- **Application**: Orquestación de casos de uso. Servicios de aplicación, DTOs, workflows.
- **Domain**: Reglas de negocio puras. Entidades, value objects, reglas, excepciones de dominio.
- **Infrastructure**: Adaptadores de salida. Bases de datos, APIs externas, filsystems, colas.

**Regla:** la capa de dominio nunca depende de infrastructure ni de presentation.

### 2. Un módulo, una responsabilidad

Un módulo es una unidad de código cohesiva que resuelve un problema del dominio.

```
src/
  auth/
    domain/
    application/
    infrastructure/
    NOTES.md
  payments/
    domain/
    application/
    infrastructure/
    NOTES.md
```

**Reglas de módulo:**
- Cada módulo tiene su propio `NOTES.md`.
- Los módulos solo se comunican a través de interfaces definidas en application o domain.
- No permitir imports circulares entre módulos.

### 3. Naming conventions

| Elemento | Convención | Ejemplo |
|---|---|---|
| Módulos | kebab-case | `user-management`, `payment-gateway` |
| Clases / tipos | PascalCase | `UserRepository`, `PaymentDto` |
| Funciones / métodos | camelCase | `processPayment`, `validateEmail` |
| Constantes / env vars | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Archivos de test | `.test.` o `.spec. junto al archivo | `user.service.spec.ts` |
| Archivos de feature | `.feature.` para BDD | `checkout.feature` |

### 4. Gestión de dependencias

- **Dependencias externas:** concentrarlas en adaptadores (infrastructure). El domain no conoce frameworks.
- **Dependencias internas:** un módulo puede depender de otro solo a través de su capa de application/domain pública.
- **Evitar:** dependencias globales, singletons mutables, y estado compartido implícito.

### 5. Manejo de errores

- Usar excepciones de dominio para errores de negocio predecibles.
- Usar Result/Either types para flujos donde el fallo es una ruta esperada.
- Nunca propagar errores crudos de infraestructura a la capa de presentación.

### 6. Testing

- **Unitarios:** domain y application. Sin mocks de infraestructura.
- **Integración:** infrastructure y adaptadores. Con base de datos/testcontainers reales cuando sea posible.
- **E2E / Aceptación:** flujos completos de usuario. Mínimo, solo los críticos.

**Regla:** si es difícil de testear, está mal diseñado.

### 7. Configuración

- Separar configuración en tres niveles:
  1. **Default:** valores seguros por defecto en código.
  2. **Environment:** variables de entorno para diferencias entre ambientes.
  3. **Secret:** vaults o secret managers. Nunca en repos.

### 8. Logging y observabilidad

- Loggear en la capa de application o infrastructure, nunca en domain.
- Estructurar logs (JSON) para facilitar búsqueda.
- Incluir correlation-id por request en todos los logs del flujo.

## Patrones de decisión

Cuando enfrentes una decisión de arquitectura, usa este orden:

1. ¿Resuelve el problema del dominio sin agregar complejidad?
2. ¿Es fácil de testear?
3. ¿Mantiene las dependencias apuntando hacia adentro (domain como centro)?
4. ¿Sobrevive a un cambio de framework o base de datos?

Si la respuesta a alguna es "no", reconsidera.

## Complemento: Reglas base de código

Los principios arquitectónicos de BRAIN.md definen *cómo estructurar* sistemas. Las reglas de calidad de código (SOLID, DRY, KISS, YAGNI) viven en `docs/global/rules-base.md`. Lee ambos documentos antes de implementar.

- **BRAIN.md** = Patrones estructurales (capas, módulos, dependencias).
- **rules-base.md** = Estándares de escritura de código (responsabilidades, duplicación, simplicidad).

---

## Patrones validados en proyectos recientes

- **Multi-tenancy con companyId obligatorio:** Aislamiento de datos por tenant desde el día 1. Todas las queries filtran por `companyId`.
- **Tests secuenciales con DB compartida (SQLite):** En proyectos con SQLite local, usar `fileParallelism: false` en Vitest para evitar race conditions entre archivos de test.
- **Audit automático en Server Actions:** Registrar cambios sin contaminar el dominio puro. Las funciones de dominio retornan IDs + metadatos; los Server Actions (adaptadores) manejan los side effects de auditoría.
- **Scoring de madurez por severidad:** Fórmula reutilizable = 100 - Σ(penalizaciones por severidad). Aplicable a cualquier dominio de diagnóstico/assessment.

---

*Revisado: sesión F6. Reglas de negocio y autorización actualizadas. Auditoría de cambios (`area_context_audits`) es específica del dominio y no amerita patrón global. No requieren promoción a BRAIN global.*

*Este documento mejora con cada proyecto. Si descubres un patrón que funciona consistentemente, proponlo para subir a BRAIN.md.*
