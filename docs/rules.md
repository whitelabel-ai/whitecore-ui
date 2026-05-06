# Reglas del Proyecto

> Reglas de negocio, de seguridad, límites técnicos y compliance. Léelo antes de implementar.

## Reglas de negocio

> Lógica del dominio que debe respetarse en todo el sistema.
> Formato: ID → Descripción → Dónde se aplica → Penalización si se viola.

### RN-001: _(nombre de la regla)_

- **Descripción:** _¿Qué debe ocurrir?_
- **Aplicación:** _¿En qué módulos/casos de uso?_
- **Validación:** _¿Cómo se verifica? (test, constraint DB, etc.)_

## Reglas de seguridad

### SEG-001: Autenticación

- **Regla:** _cómo se maneja la autenticación_
- **Implementación:** _dónde vive el código_

### SEG-002: Autorización

- **Regla:** _cómo se manejan permisos y roles_
- **Implementación:** _dónde vive el código_

### SEG-003: Datos sensibles

- **Regla:** _qué datos se consideran sensibles y cómo se protegen_
- **Implementación:** _encriptación, hashing, masking_

## Límites técnicos

> Restricciones del sistema que no son reglas de negocio pero afectan el diseño.

- **Tiempo máximo de respuesta API:** _(ej: 500ms p95)_
- **Tamaño máximo de payload:** _(ej: 10MB)_
- **Límites de rate:** _(ej: 100 req/min por usuario)_
- **Compatibilidad:** _(ej: soportar últimas 2 versiones de cliente móvil)_

## Compliance

> Requisitos legales o regulatorios.

- _(ej: GDPR — derecho al olvido implementado en módulo X)_
- _(ej: PCI-DSS — datos de tarjetas nunca persisten en logs)_

## Reglas de código

> Convenciones que deben seguirse y que la CI puede verificar.

- [ ] No commits directos a `main` o `develop`.
- [ ] Todo PR requiere al menos 1 aprobación humana.
- [ ] Toda feature nueva requiere test de aceptación.
- [ ] No se permite código sin tipo / sin tipado explícito.

---

*Actualizar este documento cuando cambien las reglas. El CDM detectará automáticamente si se modifican archivos relacionados.*
