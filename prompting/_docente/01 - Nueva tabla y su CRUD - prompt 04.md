# Ejercicio 01 — Prompt 04: la corrección (pensamiento crítico) ✅🔍

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** El paso más importante: la IA se equivocó y el alumno lo corrige. Acá se ve si **leyó críticamente** o pegó y listo.

---

## Lo que la IA hizo MAL en el `prompt 03`

Supongamos que el `materias-controller.js` que devolvió la IA vino con **dos errores sutiles** (muy típicos):

```js
// ❌ POST: devuelve 200 en vez de 201
router.post('', async (req, res) => {
    try {
        const newId = await currentService.createAsync(req.body);
        if (newId > 0) {
            res.status(StatusCodes.OK).json(newId);     // ← debería ser CREATED (201)
        } else {
            res.status(StatusCodes.BAD_REQUEST).json(null);
        }
    } catch (error) { /* ... */ }
});

// ❌ PUT: se "olvidó" de validar que el id de la URL coincida con el del body
router.put('/:id', async (req, res) => {
    try {
        let entity = req.body;
        entity.id = parseInt(req.params.id);
        const rowsAffected = await currentService.updateAsync(entity);
        // ... (falta el chequeo entity.id vs req.params.id)
    } catch (error) { /* ... */ }
});
```

Funciona "a primera vista" (Postman devuelve algo), pero **se desvía del patrón de `cursos`**.

## Cómo lo detecta el alumno

Comparando contra `cursos-controller.js` (la referencia) nota que:
- En `cursos` el POST responde `StatusCodes.CREATED` (201), no `OK`.
- En `cursos` el PUT tiene el chequeo `if (entity.id && parseInt(entity.id) !== id) → 400`.

## El prompt de corrección

```
Encontré dos diferencias con cursos-controller.js que me pasaste de referencia:

1) En el POST estás devolviendo StatusCodes.OK (200), pero al crear un recurso debería
   ser StatusCodes.CREATED (201), como en cursos.
2) En el PUT te falta la validación de que el id de la URL coincida con el del body
   (el if que devuelve 400 si entity.id !== id), que cursos sí tiene.

Corregí esas dos cosas manteniendo el resto igual. No cambies nada más.
```

## Por qué este prompt es oro (para evaluar)

- El alumno **no aceptó el primer resultado**: lo comparó contra la referencia y encontró desvíos.
- La corrección es **específica** (señala qué y por qué), no "está mal, arreglalo".
- Demuestra que **entiende** la diferencia entre 200 y 201, y para qué sirve la validación del PUT.

## Para comparar con el alumno

- 🟢 **Ideal**: trae al menos una iteración de corrección como esta (siempre hay algo que la IA hace distinto).
- 🟡 Si dice *"la IA me lo dio todo perfecto, no corregí nada"* → casi seguro **no lo revisó**. Preguntale en vivo: *"abrí tu controller al lado de cursos-controller.js y buscá una diferencia"*. Si no encuentra ninguna y no hay ninguna, ok; pero lo normal es que aparezca algo.
- 🔴 Si no puede explicar por qué el POST va 201 → no entendió, copió.

> 🤔 Pregunta de cierre para el oral: *"¿cuál fue la cosa que la IA te dio distinta a como esperabas, y cómo te diste cuenta?"*
