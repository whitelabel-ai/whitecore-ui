# SKILL-02 — TDD en Sesión

> Capa 3: Ejecución. En toda implementación. No es opcional.

## Propósito

Garantizar que el código funcione como se espera y que cada pieza de lógica tenga una red de seguridad. El TDD (Test Driven Development) no es un "nice to have"; es el método de trabajo.

## Protocolo Red-Green-Refactor

### 🔴 RED — Escribe el test que falla primero

1. Antes de escribir código de producción, escribe un test que describa el comportamiento esperado.
2. Ejecuta el test y **confirma que falla**.
   - Si pasa de inmediato, el test es inválido (está probando nada o ya existe código).
3. El test debe ser lo más pequeño posible: un solo comportamiento, una sola aserción fuerte.

**Regla:** Si no ves el test fallar, no puedes continuar.

### 🟢 GREEN — Implementación mínima para pasar

1. Escribe el código de producción mínimo necesario para que el test pase.
2. No agregues lógica "por si acaso".
3. No optimices todavía.
4. Está permitido hacer trampa (hardcodear) si es el paso más rápido a verde. Se arregla en refactor.

**Regla:** El objetivo es pasar el test, no resolver el mundo.

### 🔵 REFACTOR — Limpia sin cambiar comportamiento

1. Con el test pasando, mejora el código: nombres, duplicación, claridad.
2. Ejecuta el test después de cada cambio pequeño. Debe seguir pasando.
3. Si el test falla durante refactor, revertí el último cambio y revisa.

**Regla:** Refactor sin miedo, pero solo con tests verdes.

## Ciclo completo

```
RED (test falla) → GREEN (pasa) → REFACTOR (limpia) → RED (siguiente test)
```

## Reglas de disciplina

- **Nunca implementar sin un test rojo previo.**
- **Nunca agregar más de un concepto por test.** Si necesitas dos aserciones, probablemente necesitas dos tests.
- **Nunca dejar tests comentados o skipped sin documentar por qué.**
- **Si un test es difícil de escribir, la interfaz está mal diseñada.** Vuelve al diseño. Revisa `docs/global/rules-base.md` — especialmente SRP (¿tu clase hace demasiado?) y DIP (¿dependes de concreciones difíciles de mockear?).

## Tests de aceptación / E2E

Los tests end-to-end validan flujos críticos del usuario. No forman parte del ciclo RGR rápido (son lentos), pero sí del ciclo de feature completo.

### Cuándo escribirlos

- Basados en el **PRD** y los criterios de aceptación.
- Al **inicio de la feature**, antes o junto a los primeros unit tests.
- Se dejan en rojo mientras se implementa la feature.
- Se vuelven verdes al finalizar la implementación.

### Herramienta default: Playwright

- Usar selectores robustos: `data-testid`, roles ARIA, o texto visible.
- No usar selectores CSS frágiles (clases generadas por frameworks).
- Cubrir solo los **flujos críticos**: login, checkout, flujo principal de negocio.
- No escribir E2E para cada caso edge; eso es trabajo de los unit tests.

### Ejemplo de test E2E mínimo

```typescript
import { test, expect } from '@playwright/test';

test('usuario puede completar el flujo de compra', async ({ page }) => {
  await page.goto('/productos');
  await page.getByRole('button', { name: 'Agregar al carrito' }).first().click();
  await page.getByRole('link', { name: 'Carrito' }).click();
  await page.getByRole('button', { name: 'Pagar' }).click();
  await expect(page.getByText('Orden confirmada')).toBeVisible();
});
```

**Regla:** Si el PRD no define un flujo crítico que justifique un E2E, no escribas uno.

## Estructura de test sugerida

```
describe('Modulo / Clase / Funcion', () => {
  describe('comportamientoX', () => {
    it('deberia hacer Y cuando Z', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Test de calidad

- ¿Cada test tiene un único motivo para fallar?
- ¿Los nombres de los tests describen comportamiento, no implementación?
- ¿Los tests sirven como documentación ejecutable?
- ¿Corren en menos de 1 segundo individualmente (unitarios)?

---

*Skill nativa de WhiteCore OS. Markdown puro, sin dependencias.*
