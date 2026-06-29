# Ejercicio 04 — Validaciones y códigos de error ⭐⭐⭐

**Foco:** validación de input, manejo de errores, patrones repetidos
**Tiempo estimado:** 1–2 clases
[⬅️ Volver al README](./00%20-%20README%20-%20Como%20usar%20este%20TP%20de%20Prompting.md)

---

## 🎯 Objetivo

Que uses la IA para **detectar un patrón de validación ausente o repetido** y proponer una forma consistente de manejar input inválido y códigos de error. Hoy el proyecto **casi no valida nada**.

---

## 📋 El problema

Mirá `alumnos-controller.js` y `alumnos-service.js`:

- En el `POST`, `let entity = req.body` pasa **directo** al service. Si mando `{}` (body vacío), o `nombre` con 5000 caracteres, o `id_curso` como `"hola"`, nadie lo frena hasta que explota la query.
- El `repository` hace `?? ''` y `?? 0` → **silenciosamente** te inserta un alumno con `nombre = ''`. No es un error, pero seguramente no es lo que querés.
- Los errores se manejan con `try/catch` que mayormente devuelve `400` o `500` con un `error.message` crudo (que puede filtrar info de la base — ojo, esto se cruza con el ejercicio 09).
- La única validación de negocio que existe es `validarCursoExiste` en el service. **Está buenísima como modelo a seguir**, pero es la excepción, no la regla.

---

## 📦 Qué tenés que lograr

1. Definir **qué es un alumno válido** (¿`nombre` obligatorio? ¿`fecha_nacimiento` con formato válido? ¿`id_curso` numérico? ¿`hace_deportes` booleano?).
2. Implementar validación de input **antes** de llegar al repository. Elegí dónde: middleware, capa `business/`, o helper de validación (justificá).
3. Unificar los **códigos de error**: 400 para input inválido, 404 para no encontrado, 409 para conflicto, 500 para error inesperado. Que sea **consistente** entre entidades.
4. Devolver mensajes de error **útiles para el cliente pero que no filtren detalles internos** de la base.

---

## 🤖 Cómo encarar el prompting

> 💡 Este ejercicio es ideal para que la IA primero **audite** y vos decidas. El prompt de diagnóstico es el más valioso.

**Prompt 1 — Auditoría de validación:**

> Pegale el controller, el service y el repository de `alumnos`, y pedile: *"hacé una tabla de todos los inputs que el usuario puede mandar y qué pasa hoy si cada uno viene vacío, con tipo incorrecto, o malicioso. No escribas código todavía — quiero ver los agujeros."*

**Prompt 2 — Diseño del patrón:**

> *"Proponé un patrón de validación consistente para esta arquitectura en capas. ¿Validación en middleware, en el service, o con una librería? Dame pros y contras de cada uno para un proyecto educativo sin dependencias pesadas."*

**Prompt 3 — Implementación.**

> ⚠️ **Trampa de los códigos de error**: la IA tiende a devolver `500` para todo lo que falla. Pero un body inválido es **culpa del cliente** → eso es `400`, no `500`. Pedile explícitamente que **distinga error del cliente (4xx) de error del servidor (5xx)**.

> ⚠️ **Otra trampa**: si le pedís "validá todo", te puede meter `zod`, `joi` o `express-validator`. Eso puede estar bien, pero es una **decisión de arquitectura** — no la tomes por default. Si agregás una dependencia, justificala en la reflexión.

---

## 🔍 Verificación del resultado

- [ ] `POST /api/alumnos` con body `{}` devuelve **400** (no 500, no un 201 con campos vacíos).
- [ ] `POST` con `id_curso` que no existe sigue devolviendo el error de negocio correcto (no rompas `validarCursoExiste`).
- [ ] `GET /api/alumnos/abc` (id no numérico) se maneja con un código sensato, no con un 500 críptico.
- [ ] Los mensajes de error **no incluyen** el texto crudo del error de PostgreSQL (nombres de tablas, columnas, etc.).
- [ ] La validación es **consistente**: `alumnos` y `cursos` validan con el mismo patrón.
- [ ] Mostrás que entendés **dónde** pusiste la validación y por qué (no "porque la IA la puso ahí").

> 🤔 Pregunta para el oral: *¿la validación va en el controller, en el service o en un middleware? Defendé tu elección. ¿Qué pasa si la misma regla la necesitás en dos endpoints distintos?*

---

## ✅ Entrega

Bitácora + commit. **Caso obligatorio en la reflexión:** mostrá un input inválido concreto, qué hacía el sistema antes (lo dejaba pasar / tiraba 500) y qué hace ahora.
