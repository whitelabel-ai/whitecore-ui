# WhiteCore OS Template

> La infraestructura de inteligencia para cualquier repo de código.

WhiteCore OS no es un framework ni una metodología. Es un sistema de documentación, contexto, memoria y disciplina que garantiza que cualquier agente de IA o desarrollador humano trabaje con el conocimiento correcto, en el momento correcto, y que sea estructuralmente difícil hacer las cosas mal.

## Qué incluye esta plantilla

- **Context Engineering**: 8 niveles de contexto con responsabilidades claras.
- **Memory Engineering**: Persistencia del conocimiento en 4 niveles (Global → Proyecto → Módulo → Sesión).
- **Hardness Engineering**: Reglas que se cumplen porque el sistema lo exige (docs → CI → imposible violar).
- **Context Dependency Map (CDM)**: Detección automática de documentos de contexto desactualizados.
- **Skills nativas**: Brainstorming socrático, TDD en sesión, Debugging sistemático.

## Estructura

```
.
├── .whitecore/
│   ├── deps.yml                    # Mapa de dependencias de contexto
│   ├── check-context-freshness.js  # Validador CI (Node, sin deps externas)
│   ├── arch-check.js               # Architecture checks (funciones largas, duplicados, etc.)
│   └── arch-check.config.yml       # Configuración de arch-check
├── .github/workflows/
│   └── whitecore-ci.yml            # Pipeline de Hardness Medium
├── docs/
│   ├── context.md                  # Stack y decisiones de arquitectura
│   ├── rules.md                    # Reglas de negocio y seguridad
│   ├── project.md                  # Features y slices planificados
│   └── global/
│       └── rules-base.md           # Estándares SOLID, DRY, KISS, YAGNI
├── skills/
│   ├── SKILL-brainstorming.md
│   ├── SKILL-tdd.md
│   └── SKILL-debugging.md
├── src/_template/
│   └── NOTES.md                    # Ejemplo de notas por módulo
├── tests/
│   ├── unit/                       # Tests unitarios
│   ├── integration/                # Tests de integración
│   └── e2e/                        # Tests end-to-end (Playwright)
├── playwright.config.ts            # Configuración de Playwright
├── AGENTS.md                       # Guía fundamental para agentes
├── BRAIN.md                        # Patrones globales de arquitectura
├── CLAUDE.md                       # Entrada rápida para Claude
├── SESSION.md.template             # Plantilla para sesiones activas
└── package.json                    # Scripts y dependencias
```

## Cómo usar esta plantilla

### 1. Copia la plantilla en tu nuevo repo

Puedes usar "Use this template" en GitHub o copiar los archivos manualmente.

### 2. Personaliza los documentos del proyecto

Edita estos archivos con la información específica de tu proyecto:

- `docs/context.md` — Stack, tecnologías, decisiones de arquitectura.
- `docs/rules.md` — Reglas de negocio, seguridad, límites técnicos.
- `docs/project.md` — Roadmap, features en curso, slices planificados.
- `BRAIN.md` — Adapta o reemplaza con los patrones globales de tu organización.

### 3. Configura el CDM

Edita `.whitecore/deps.yml` para mapear qué archivos de código invalidan qué documentos de contexto. Esto es clave para mantener la documentación fresca automáticamente.

### 4. Crea SESSION.md al empezar a trabajar

Copia `SESSION.md.template` a `SESSION.md` (no lo versiones en git; agrégalo a `.gitignore`). El agente lo usará para mantener contexto durante la sesión.

### 5. Crea NOTES.md por módulo

Cada vez que crees un módulo en `src/`, crea un `NOTES.md` dentro de su carpeta siguiendo el patrón de `src/_template/NOTES.md`.

### 6. Configura Playwright (si usarás E2E)

```bash
npx playwright install
```

Ajusta `playwright.config.ts` con la base URL y el puerto de tu aplicación.

### 7. Activa la CI

El archivo `.github/workflows/whitecore-ci.yml` incluye la pipeline base. Ajústala a tu stack (añade los pasos de lint, type-check y build que uses).

## Checklist de setup inicial

- [ ] Renombrar/descripción del repo actualizada
- [ ] `docs/context.md` completado
- [ ] `docs/rules.md` completado
- [ ] `docs/project.md` completado
- [ ] `.whitecore/deps.yml` adaptado a la estructura de carpetas del proyecto
- [ ] CI ajustada al stack del proyecto (lint, type-check, tests, build)
- [ ] Playwright configurado con la base URL correcta
- [ ] `SESSION.md` agregado a `.gitignore`
- [ ] Primer módulo creado con su `NOTES.md`

## Principios de WhiteCore

1. **El conocimiento sobrevive al individuo.** Si es importante, está en un doc.
2. **Lo correcto es el camino de menor resistencia.** El sistema facilita hacer las cosas bien.
3. **Un documento, una responsabilidad.** Sin solapamiento.
4. **El humano decide, la IA ejecuta.** El humano define el QUÉ y valida el CÓMO.
5. **El sistema aprende.** Lo que funciona sube al estándar global.
6. **El trigger es el cambio, no el dev.** El cambio en el repo activa las verificaciones.
7. **Sin dependencias externas para funcionalidad core.** Markdown + scripts + CI.

---

**WhiteCore OS v1.2** — Plantilla base agnóstica a stack.
