# SKILL-03 — Debugging Sistemático

> Capa 3: Ejecución. Ante cualquier error o comportamiento inesperado.

## Propósito

Evitar que el agente o el dev "prueben cosas al azar" hasta que el síntoma desaparezca. El debugging sistemático exige evidencia antes del fix.

## Protocolo

### Fase 1 — Reproducir de forma determinista

1. **Identifica las condiciones exactas** bajo las cuales ocurre el bug.
2. **Crea un test (o script) que reproduzca el fallo.**
   - Si no puedes reproducirlo consistentemente, no entiendes el bug.
3. **Documenta el entorno:** versión de runtime, datos de entrada, estado del sistema.

**Regla:** Si no se puede reproducir, no se puede fixear.

### Fase 2 — Listar 3+ hipótesis antes de investigar

Antes de tocar código o poner `console.log`, escribe al menos tres explicaciones posibles del root cause. Considera también DRY: ¿el bug está en código duplicado que solo se fixeó en un lado mientras el otro sigue roto?

Ejemplo:
1. La query de base de datos no filtra por tenant_id.
2. El caché está devolviendo datos de otra sesión.
3. La validación del input permite un valor nulo que rompe el cálculo posterior.

**Regla:** No investigues sin hipótesis. Evita el "trial and error" ciego.

### Fase 3 — Confirmar root cause con evidencia

1. **Diseña un experimento por hipótesis** que la confirme o la descarte.
   - Logs dirigidos, breakpoints, tests unitarios aislados, query manual en DB.
2. **Ejecuta los experimentos y registra resultados.**
3. **Identifica la hipótesis que la evidencia respalda.**

**Regla:** Nunca toques código de producción en esta fase. Solo investigación.

**Regla de oro:** Si no puedes explicar por qué el fix va a funcionar, no entiendes el bug.

### Fase 4 — Fix mínimo + test de regresión

1. **Implementa el fix más pequeño posible** que corrija la root cause.
   - No el parche más grande. No la refactorización completa.
2. **Confirma que el test de reproducción ahora pasa.**
3. **Escribe un test de regresión** que falle si el bug vuelve a introducirse.
4. **Ejecuta todo el test suite relevante** para asegurar que no rompiste nada.

**Regla:** Nunca parchear síntomas. Si el fix no ataca la root cause, vuelve a Fase 2.

## Reglas de disciplina

- **Nunca tocar código hasta Fase 3.**
- **Nunca aplicar un fix sin root cause confirmada.**
- **Nunca dejar un bug sin test de regresión.**
- **Nunca asumir que "ya se arregló solo"." Si no sabes por qué se arregló, no está arreglado.

## Anti-patrones a evitar

| Anti-patrón | Por qué es dañino |
|---|---|
| "Pruebo esto a ver si funciona" | Cambios sin teoría. Pueden esconder el bug o crear nuevos. |
| Logging masivo y rezar | Produce ruido, no certeza. |
| Fixear el síntoma más obvio | El root cause sigue vivo y volverá. |
| "En mi máquina funciona" | No es reproducible determinista. |

## Test de calidad

Antes de declarar un bug resuelto, verifica:
- [ ] Tengo un test que reproduce el bug (y fallaba antes del fix).
- [ ] Puedo explicar la root cause en una oración.
- [ ] El fix es el mínimo necesario.
- [ ] Hay un test de regresión.
- [ ] Todos los tests existentes siguen pasando.

---

*Skill nativa de WhiteCore OS. Markdown puro, sin dependencias.*
