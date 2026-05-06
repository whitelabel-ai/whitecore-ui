# SKILL-01 — Brainstorming Socrático

> Capa 1: Definición. Antes de cualquier feature nueva.

## Propósito

Evitar que el agente (o el dev) salte directamente a soluciones antes de entender el problema real. El brainstorming socrático utiliza preguntas para desentrañar el QUÉ antes del CÓMO.

## Protocolo

### Paso 1: El dev describe la idea o feature

El humano presenta una idea, necesidad, o requerimiento. El agente NO planifica ni escribe código todavía.

### Paso 2: El agente pregunta socráticamente

El agente hace UNA pregunta a la vez. Espera la respuesta del humano antes de la siguiente.

#### Preguntas obligatorias (mínimo)

1. **¿Cuál es el problema real que estamos resolviendo?**
   - No aceptes "necesitamos una pantalla de X". Busca el problema subyacente.

2. **¿Quién es el usuario afectado y qué hace hoy sin esta feature?**
   - Contexto del usuario actual. Workarounds existentes.

3. **¿Qué define el éxito de esta feature?**
   - Métrica o comportamiento observable que confirme que funcionó.

4. **¿Qué restricciones conocemos? (tiempo, tecnología, negocio, legal)**
   - Límites explícitos que condicionan la solución.

5. **¿Qué alternativas descartamos y por qué?**
   - Documentar el camino no tomado evita reconsiderarlo sin razón.

### Paso 2b — Filtro KISS / YAGNI

Después de las preguntas socráticas, el agente aplica un filtro de simplicidad antes de generar el PRD:

- **¿Estamos resolviendo el problema más simple que funciona, o anticipando casos que quizás no ocurran?** (YAGNI)
- **¿La solución propuesta puede explicarse a un dev junior en 5 minutos?** (KISS)
- Si la respuesta indica sobre-ingeniería, volver a preguntar hasta refinar el alcance.

### Paso 3 — Solo cuando no hay más respuestas

Cuando el humano confirme que no hay más que agregar, el agente resume en un **PRD.md** mínimo:

```markdown
# PRD — {nombre de la feature}

## Problema
{qué se resuelve}

## Usuario afectado
{quién y contexto}

## Éxito
{cómo se mide}

## Restricciones
{lista}

## Alternativas descartadas
{lista con razones}

## Alcance propuesto
{qué está dentro y qué fuera de esta primera entrega}
```

## Reglas de disciplina

- **Nunca más de una pregunta a la vez.** El diálogo es secuencial.
- **Nunca proponer soluciones durante el brainstorming.** Solo preguntas y clarificaciones.
- **Nunca asumir el problema.** Si el humano no puede articularlo claramente, seguir preguntando.
- **El PRD es el output obligatorio.** Sin PRD no hay paso a Capa 2.

## Test de calidad

El PRD pasa si un tercero (o el mismo agente en 1 semana) puede leerlo y entender:
- Qué problema se resuelve.
- Por qué esta solución y no otra.
- Dónde termina el alcance (qué NO hace).

---

*Skill nativa de WhiteCore OS. Markdown puro, sin dependencias.*
