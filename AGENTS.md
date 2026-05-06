# AGENTS.md — Guía de Operación WhiteCore OS

> Documento fundacional para cualquier agente de IA que opere en este repositorio.

## Visión general

WhiteCore OS es la infraestructura de inteligencia sobre la que corre este proyecto. No es un framework ni una metodología. Es el sistema que garantiza que trabajes con el conocimiento correcto, en el momento correcto, y que sea estructuralmente difícil hacer las cosas mal.

**Versión:** 1.2  
**Estado:** Activo

## Los 3 Pilares

### Pilar I — Context Engineering

"El agente no lee todo siempre. Lee lo relevante para la tarea actual."

Diseña qué información recibes, cuándo, y en qué orden. 8 capas de contexto con responsabilidades sin solapamiento.

| Alcance | Archivo | Propósito | Cuándo |
|---|---|---|---|
| 0 — Global | `BRAIN.md` | Patrones de arquitectura globales | Siempre |
| 1 — Global | `docs/global/behavior.md` *(opcional)* | Cómo comportarse en cualquier repo | Siempre |
| 2 — Global | `docs/global/rules-base.md` *(opcional)* | Reglas técnicas globales | Antes de implementar |
| 3 — Proyecto | `docs/context.md` | Stack y decisiones del proyecto | Siempre |
| 4 — Proyecto | `docs/rules.md` | Reglas de negocio y seguridad | Antes de implementar |
| 5 — Proyecto | `docs/project.md` | Features y slices planificados | Al planificar |
| 6 — Módulo | `src/{modulo}/NOTES.md` | Conocimiento táctico del módulo | Al trabajar el módulo |
| 7 — Sesión | `SESSION.md` | Decisiones y contexto de la sesión activa | Durante sesión |

**Principio clave:** un documento = una responsabilidad. Sin solapamiento. Si la misma información está en dos lugares, eventualmente se contradice y no sabrás a cuál creerle.

### Pilar II — Memory Engineering

"Lo que el agente aprende debe sobrevivir a la sesión."

4 niveles de persistencia. SESSION.md estructurado con protocolo de cierre formal.

| Nivel | Qué se guarda | Dónde | Quién mantiene |
|---|---|---|---|
| Global | Estándares y patrones que trascienden proyectos | `BRAIN.md` / `~/.config/whitelabel/` | Dev lead + agente (vía PR) |
| Proyecto | Decisiones de arquitectura, reglas, estado | `docs/` en el repo | Dev lead + agente |
| Módulo | Decisiones tácticas, deuda técnica, patrones | `src/{modulo}/NOTES.md` | Dev del módulo |
| Sesión | Contexto activo, intentos, descubrimientos | `SESSION.md` (temporal) | Agente durante sesión |

#### Protocolo de Sesión

**Inicio de sesión**
- Lee `SESSION.md` previo si existe.
- Recupera contexto y pendientes.
- Carga `NOTES.md` de módulos relevantes.
- Si no hay `SESSION.md`, créalo desde `SESSION.md.template`.

**Durante la sesión**
- Actualiza `SESSION.md` ante cada decisión de arquitectura.
- Registra intentos fallidos y por qué.
- Documenta comportamientos inesperados.
- Marca deuda técnica identificada.

**Cierre de sesión**
- Propón qué sube a `NOTES.md` (módulo).
- Propón qué sube a `docs/` (proyecto).
- Propón qué sube a `BRAIN.md` (global).
- El dev aprueba → ejecuta la promoción.
- `SESSION.md` se archiva o elimina.

### Pilar III — Hardness Engineering

"Las reglas se cumplen porque el sistema las hace cumplir."

3 niveles de dureza:

| Nivel | Mecanismo | Cuándo actúa |
|---|---|---|
| Soft | Reglas documentadas en `rules.md`, `docs/global/rules-base.md` y `BRAIN.md`. Tú las lees y sigues. | En el momento de implementar |
| Medium | CI pipeline que falla si se violan patrones: lint, type-check, arch-check, spec-coverage, context-freshness (CDM). Sin CI verde = sin merge. | En el PR, antes del merge |
| Hard | El sistema no permite completar la tarea sin satisfacer la regla: branch protection, spec-first enforcement, rules-first enforcement. | En el momento de la acción |

**Pipeline de CI (Hardness Medium):**

```
lint → type-check → arch-check → context-freshness (CDM) → tests → spec-coverage → build
```

## Mecanismo Transversal — Context Dependency Map (CDM)

El problema: bajo presión, cuando cambian los requerimientos, los documentos de contexto quedan desactualizados. Tú ejecutas con confianza sobre contexto viejo — confianza falsa. El CDM lo detecta automáticamente.

**El principio:** el trigger de actualización no es el dev. Es el cambio mismo.

1. **Cambio en el repo** — PR abierto con diff.
2. **CI detecta** — `check-context-freshness.js` lee `.whitecore/deps.yml` y cruza con el diff.
3. **Bloquea si hay pendientes** — CI falla con lista de docs afectados sin revisión.
4. **IA actualiza** — Dev instruye, IA revisa diff y actualiza docs o documenta por qué no.
5. **CI pasa** — Merge disponible.

## Skills Nativas de Disciplina

Las skills gobiernan **cómo** trabajas dentro de una sesión. Léelas antes de aplicarlas.

- `skills/SKILL-brainstorming.md` — Brainstorming Socrático (Capa 1: Definición)
- `skills/SKILL-tdd.md` — TDD en Sesión (Capa 3: Ejecución)
- `skills/SKILL-debugging.md` — Debugging Sistemático (Capa 3: Ejecución)

**Regla por skill:**
- Brainstorming: nunca hagas más de una pregunta a la vez.
- TDD: nunca implementes sin un test rojo previo.
- Debugging: nunca toques código hasta confirmar la root cause (Fase 3).

## Flujo Completo (3 Capas)

### Capa 1 — Definición
Humano define el QUÉ.

```
SKILL-01 Brainstorming → Conversación con cliente → PRD.md
```

### Capa 2 — Traducción
Humano valida el CÓMO.

```
PRD-TRANSLATOR.md → docs/project.md + docs/rules.md + docs/context.md
→ Cerebros revisan en paralelo → Humano: go / no-go
```

### Capa 3 — Ejecución
IA implementa con método.

```
Specs (red) → SKILL-02 TDD → CI + CDM check → Preview efímero
→ Humano aprueba → develop → staging → main
```

### Ambientes

| Ambiente | Rama | Propósito | Acceso |
|---|---|---|---|
| Preview | `feat/{id}` | Efímero, por PR. Se destruye al mergear. | Dev reviewer |
| Staging | `develop` | Integración de features mergeadas. | Equipo interno |
| Producción | `main` | Requiere aprobación humana explícita en PR a main. | Clientes |

## Los Cerebros (Conocimiento Especializado)

Los cerebros operan en dos modos: contexto durante ejecución, y revisor durante traducción del PRD.

- `BRAIN.md` + `BRAIN.review.md` — Arquitectura
- `BRAIN-security.md` + `BRAIN-security.review.md` — Seguridad
- `BRAIN-qa.md` + `BRAIN-qa.review.md` — QA
- `BRAIN-business.md` + `BRAIN-business.review.md` — Negocio

*(En esta plantilla base, `BRAIN.md` es el punto de partida. Los cerebros especializados se añaden según las necesidades del proyecto.)*

## Principios de Diseño

Toda decisión de diseño debe justificarse con al least uno de estos principios:

1. **El conocimiento sobrevive al individuo.** Ninguna decisión queda atrapada en la cabeza de un dev o en el historial de una conversación.
2. **Lo correcto es el camino de menor resistencia.** El sistema está diseñado para que hacer las cosas bien sea más fácil que hacerlas mal.
3. **Un documento, una responsabilidad.** Sin solapamiento. Si la misma información está en dos lugares, eventualmente se contradicen.
4. **El humano decide, la IA ejecuta.** Los humanos definen el QUÉ y validan el CÓMO. La IA traduce, implementa y verifica.
5. **El sistema aprende.** Lo que funciona en un proyecto sube al estándar global.
6. **El trigger es el cambio, no el dev.** Ningún mecanismo de mantenimiento depende de que el dev recuerde activarlo.
7. **Sin dependencias externas para funcionalidad core.** WhiteCore no adopta herramientas de terceros para resolver problemas que puede resolver con archivos, protocolos y scripts.

## Test para nuevas decisiones

Antes de proponer un cambio al sistema, pregúntate:

> ¿Esta decisión hace el sistema más robusto sin agregar complejidad innecesaria? ¿Qué principio la justifica?

## Estado v1.2

- ✅ Context Engineering (infraestructura de docs)
- ✅ Memory Engineering (niveles global / proyecto / módulo)
- ✅ Hardness Medium — CI base
- ✅ Capa 2 — Traductor PRD → docs
- ✅ Spec Driven Development (Capa 3)
- 🔄 SESSION.md estructurado v1.2
- 🔄 Context Dependency Map (CDM)
- 🔄 Skills nativas (Brainstorming, TDD, Debugging)

---

*WhiteCore OS — Documento fundacional para agentes.*
