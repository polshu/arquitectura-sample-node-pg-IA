# Ejercicio 03 — Prompt 02: ejecución (un helper a la vez) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Segundo paso: implementar el candidato más seguro primero (el helper de respuestas).

---

## El prompt

```
Arranquemos por el candidato más seguro: el helper de respuestas.

Tarea: creá `src/helpers/respuestas-helper.js` con funciones puras exportadas con ES
modules: responderOk(res, data), responderNotFound(res, msg) y responderError(res, error).
Cada una debe hacer EXACTAMENTE el mismo res.status(...).send/json(...) que hoy está
escrito a mano en los endpoints (OK=200, NotFound=404, Error=500 con `Error: ${error.message}`).

Después mostrame cómo quedaría UN endpoint de alumnos-controller.js usándolo, sin
cambiar en nada la respuesta HTTP (mismos status, mismo body).

Restricciones: no toques los services ni los repositories. No metas todavía el
asyncHandler (ese lo evaluamos aparte porque es más riesgoso). No agregues dependencias.
```

## Por qué este prompt

- Va por el candidato de **menor riesgo** primero (lo que marcó el diagnóstico).
- **Restricción central**: "sin cambiar la respuesta HTTP". Y pide ver **un** endpoint para revisar antes de aplicarlo a todos.
- Deja el `asyncHandler` **afuera** a propósito (se evalúa en el `prompt 03`).

---

## Qué debería devolver la IA (respuesta modelo)

```js
// src/helpers/respuestas-helper.js
import { StatusCodes } from 'http-status-codes';

export const responderOk       = (res, data)  => res.status(StatusCodes.OK).json(data);
export const responderNotFound = (res, msg)   => res.status(StatusCodes.NOT_FOUND).send(msg);
export const responderError    = (res, error) =>
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
```

```js
// un endpoint usándolo
router.get('/:id', async (req, res) => {
    try {
        const entity = await currentService.getByIdAsync(req.params.id);
        if (entity != null) responderOk(res, entity);
        else                responderNotFound(res, `No se encontro la entidad (id:${req.params.id}).`);
    } catch (error) {
        responderError(res, error);
    }
});
```

## Para comparar con el alumno

- ✅ ¿El helper son **funciones puras** en `src/helpers/`, ES modules?
- ✅ ¿Los status code quedaron **idénticos** (200/404/500)?
- ⚠️ Ojo: este helper de error responde **500**. En el POST/PUT, el `catch` original responde **400**. Si el alumno reemplaza el catch del POST con `responderError`, **cambia 400 → 500**. Un alumno fino o agrega un `responderBadRequest`, o no usa `responderError` en el POST. → esto es lo que dispara el `prompt 03`.
