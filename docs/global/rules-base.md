# Reglas Base de Código

> Estándares universales aplicables a **frontend y backend**. Léelo antes de implementar cualquier feature.
>
> Complementa a `BRAIN.md` (patrones arquitectónicos). Mientras BRAIN define *cómo estructurar*, este documento define *cómo escribir código de calidad*.

## SOLID

### S — Single Responsibility Principle

> Un módulo, clase o función debe tener un único motivo para cambiar.

**Frontend:**
- Un componente de UI no debe manejar simultáneamente renderizado, fetching de datos y validación de formularios.
- Extrae lógica en hooks personalizados (`useAuth`, `useForm`) y servicios (`apiClient`).
- **Ejemplo:** `UserProfileCard` solo muestra datos. `useUserProfile` obtiene los datos. `UserForm` maneja la edición.

**Backend:**
- Un controlador HTTP solo enruta y serializa. La lógica de negocio vive en servicios de aplicación o dominio.
- **Ejemplo:** `OrderController` recibe la request y delega a `CreateOrderUseCase`. Este último orquesta `OrderRepository`, `PaymentGateway` y `NotificationService`.

**Anti-patrón:** God Component, God Class, God Function.

**Self-check:** ¿Puedo describir lo que hace esta unidad en una oración sin usar "y"?

---

### O — Open/Closed Principle

> Abierto para extensión, cerrado para modificación.

**Frontend:**
- Variantes de UI vía props o configuración, no copiando y modificando el componente base.
- **Ejemplo:** `Button variant="primary|secondary|danger"` en vez de `PrimaryButton`, `SecondaryButton`, `DangerButton` duplicados.
- Para casos más complejos, usar composición: `Modal` recibe `header`, `body`, `footer` como props.

**Backend:**
- Nuevos tipos de notificación (email, SMS, push) se agregan creando una nueva clase que implementa la misma interfaz, sin tocar el dispatcher existente.
- **Ejemplo:** `NotificationSender` es la interfaz. `EmailSender`, `SmsSender`, `PushSender` son implementaciones. `NotificationService` recibe la lista y despacha.

**Anti-patrón:** `if/else` en cadena sobre tipos (`if (type === 'A') ... else if (type === 'B') ...`).

**Self-check:** ¿Para agregar un caso nuevo tuve que tocar código existente que ya funcionaba?

---

### L — Liskov Substitution Principle

> Las clases hijas o implementaciones deben poder sustituir a las padres sin alterar la corrección del programa.

**Frontend:**
- Un `ButtonSecondary` debe poder usarse exactamente donde se espera un `Button` sin que la UI se rompa o requiera props adicionales.
- **Ejemplo:** Si `Button` acepta `onClick` y `children`, `IconButton` no debe hacer que `children` sea obligatoriamente un `Icon` si el consumidor espera texto.

**Backend:**
- Un `PremiumDiscountStrategy` debe funcionar donde se usa `DiscountStrategy` sin que el llamador necesite saber que es "premium".
- **Ejemplo:** No introducir validaciones adicionales en la subclase que la clase base no exige.

**Anti-patrón:** Subclase que lanza `NotImplementedError` o que restringe precondiciones de la clase padre.

**Self-check:** ¿Mi subtipo necesita que el llamador sepa que es diferente para funcionar correctamente?

---

### I — Interface Segregation Principle

> Es mejor muchas interfaces específicas que una interfaz general y grande.

**Frontend:**
- Separar capacidades en interfaces pequeñas. `Selectable`, `Draggable`, `Expandable` en vez de una sola `Interactive` con 10 métodos.
- **Ejemplo:** Un `TreeNode` necesita `Expandable`, no necesita `Draggable`. No debe implementar métodos vacíos.

**Backend:**
- Un repositorio no debe obligar a implementar `delete` si solo se necesita lectura.
- **Ejemplo:** `ReadableRepository<T>`, `WritableRepository<T>`, `FullRepository<T> extends ReadableRepository, WritableRepository`.

**Anti-patrón:** Implementar métodos vacíos o lanzar excepciones solo para cumplir una interfaz grande.

**Self-check:** ¿Mi interfaz tiene métodos que algunos implementadores dejan vacíos o ignoran?

---

### D — Dependency Inversion Principle

> Depender de abstracciones, no de concreciones.

**Frontend:**
- Un componente recibe servicios via props, context o inyección, no importa `FirebaseAuth` o `axios` directamente.
- **Ejemplo:** `AuthProvider` inyecta `authService: AuthPort`. En desarrollo puede ser `MockAuthService`, en producción `FirebaseAuthService`.

**Backend:**
- Un servicio de aplicación recibe `IEmailSender`, no instancia `SendGridClient`.
- **Ejemplo:** `CreateOrderUseCase` depende de `OrderRepository` (interfaz), no de `PrismaOrderRepository` (implementación).

**Anti-patrón:** Importar librerías de infraestructura directamente desde componentes de UI o lógica de dominio.

**Self-check:** ¿Puedo cambiar la implementación (base de datos, API externa, librería UI) sin tocar mi lógica de negocio?

---

## DRY — Don't Repeat Yourself

> Cada pieza de conocimiento debe tener una representación única, unificada y autoritativa.

**Frontend:**
- No copiar validaciones de formulario entre páginas. Usar schemas compartidos (Zod, Yup, JSON Schema).
- No duplicar estilos: usar tokens de diseño y componentes base.
- **Ejemplo:** `validateEmail` vive en `src/shared/validators.ts` y se usa en registro, login, perfil y checkout.

**Backend:**
- No duplicar lógica de cálculo de impuestos, reglas de negocio o mapeos de DTO en múltiples servicios.
- **Ejemplo:** `TaxCalculator` es una función pura de dominio usada por `OrderService`, `InvoiceService` y `ReportService`.

**Anti-patrón:** Copy-paste de bloques con 1-2 variaciones menores. "Lo copié porque era más rápido".

**Self-check:** Si corrijo un bug en este código, ¿debo acordarme de corregirlo en otros 3 lugares?

---

## KISS — Keep It Simple, Stupid

> La solución más simple que resuelve el problema es la correcta.

**Aplicable a ambos:**
- Preferir una función pura sobre una máquina de estados si el estado es innecesario.
- No introducir microservicios, event sourcing o arquitectura hexagonal para un CRUD simple.
- No abstraer prematuramente. La abstracción correcta emerge del código duplicado real, no de la anticipación.

**Ejemplo:** Necesitas alternar un booleano. No necesitas un reducer de Redux. `const [open, setOpen] = useState(false)` es suficiente.

**Anti-patrón:** Sistemas de plugin, configuración extrema, o abstracciones genéricas para casos hipotéticos.

**Self-check:** ¿Puedo explicar esta solución a un dev junior en 5 minutos?

---

## YAGNI — You Aren't Gonna Need It

> No implementes funcionalidad hasta que sea necesaria.

**Aplicable a ambos:**
- No agregues columnas en base de datos "por si acaso".
- No parametrizes funciones que solo se llaman con un valor en todo el codebase.
- No crees endpoints para operaciones que nadie ha pedido.
- No agregues props a componentes que nadie usa todavía.

**Ejemplo:** El cliente dice "quizás en el futuro queramos soportar múltiples monedas". Hasta que ese futuro llegue, el precio es un número con la moneda base hardcodeada o configurable por env, no un sistema de exchange rates completo.

**Anti-patrón:** "Lo dejo preparado para cuando lo necesitemos". Ese código se vuelve deuda técnica silenciosa.

**Self-check:** ¿Hay código en este PR que no se ejecuta en ningún flujo actual?

---

## Cumplimiento y verificación

### Hardness Medium — `arch-check`

La pipeline de CI ejecuta `.whitecore/arch-check.js` para detectar violaciones estructurales automáticamente:

- Funciones con más de 100 líneas (posible SRP violado).
- Funciones con más de 12 parámetros (posible DIP/ISP violado).
- Archivos duplicados (DRY violado).
- Strings mágicos duplicados (DRY violado).
- Imports circulares (acoplamiento incorrecto).

> Nota: Los thresholds se ajustan en `.whitecore/arch-check.config.yml` según el stack del proyecto.

### Hardness Soft — Revisión manual

Antes de solicitar review de un PR, verifica:

- [ ] Puedo articular la responsabilidad única de cada archivo modificado.
- [ ] No dupliqué lógica que ya existía en otro lugar.
- [ ] No agregué código "por si acaso".
- [ ] La solución es la más simple que funciona.
- [ ] Mis dependencias apuntan hacia abstracciones, no implementaciones concretas.

---

*Revisado: sesión F3. Estándares SOLID/DRY/KISS/YAGNI siguen siendo aplicables tras la introducción del módulo `diagnostic` con Server Actions y componentes cliente. El CDM verifica vigencia automáticamente.*
