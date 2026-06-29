# Ejercicio 03 — Prompt 03: la corrección (el helper se tragó un status) ✅🔍

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** El paso que mide criterio: un helper "unificó" un status code y cambió la API. ¿El alumno lo detecta probando casos de error?

---

## Lo que salió MAL

Al avanzar, el alumno (o la IA) aplicó el `responderError` (que responde **500**) **también en el `catch` del POST y del PUT** — o metió un `asyncHandler` que centraliza todo en 500. Pero en estos controllers:

```js
// POST original — el catch responde 400, NO 500
} catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);  // ← 400
}
```

Entonces, después del refactor:

- `POST /api/alumnos` con `id_curso: 999` (curso inexistente) → `AlumnosService.validarCursoExiste` hace `throw` → **antes devolvía 400**, **ahora devuelve 500**.
- Mismo problema en el `PUT`.

Funciona "a primera vista" (responde algo), pero **cambió el contrato HTTP**: un error del cliente (4xx) ahora se reporta como error del servidor (5xx).

## Cómo lo detecta el alumno

Probando los **casos de error** en Postman (como pide la verificación), no solo el happy path:

- `POST` con un body inválido / `id_curso` inexistente → ve **500** donde antes había **400**.

## El prompt de corrección

```
Encontré una regresión: después de usar responderError en los catch, el POST y el PUT
ahora devuelven 500 cuando el body es inválido o el curso no existe. Antes devolvían
400 (Bad Request), porque es un error del cliente, no del servidor.

Corregilo manteniendo los status originales: el helper responderError es para los
500 (GET / errores inesperados). Para el POST y el PUT, donde el error del cliente
es 400, agregá un responderBadRequest(res, error) y usalo ahí. No cambies ningún
otro status.
```

## Por qué este prompt es el que más vale

- El alumno **probó los casos de error**, no solo el happy path → detectó que la API cambió.
- Entiende la diferencia **4xx (culpa del cliente) vs 5xx (culpa del servidor)** — engancha con el ejercicio 04.
- La corrección es **quirúrgica**: agrega `responderBadRequest`, no rompe el resto.

## Para comparar con el alumno

- 🟢 **Ideal**: nota el cambio de 400→500 y lo corrige. Es exactamente el ítem de verificación *"los status codes no cambiaron: probá happy path y casos de error"*.
- 🟡 Si dice "anda todo" pero solo probó el happy path → pedile en vivo: *"mandá un POST con un id_curso que no exista, ¿qué status te da? ¿era ese antes?"*.
- 🔴 Si no distingue por qué un body inválido es 400 y no 500 → no entendió los códigos de error (lo profundiza el ejercicio 04).

> 🤔 Pregunta de cierre: *"un helper de respuestas, ¿debería decidir el status code, o debería decidirlo el endpoint y pasárselo? ¿dónde vive esa decisión?"*
