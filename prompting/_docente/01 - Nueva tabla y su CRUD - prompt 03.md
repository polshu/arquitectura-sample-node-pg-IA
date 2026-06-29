# Ejercicio 01 — Prompt 03: el controller + registrar en server.js ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Tercer paso: la última capa y el enchufe en el server.

---

## El prompt

```
Ahora el controller. Generá `materias-controller.js`.

Contexto: el controller es un Router de Express que recibe el request, llama al
service y responde con los status codes correctos (de `http-status-codes`). Te paso
`cursos-controller.js` como referencia:

--- cursos-controller.js ---
[PEGÁS EL ARCHIVO cursos-controller.js]

Tarea: generá `materias-controller.js` con los 5 endpoints (GET todos, GET por id,
POST, PUT por id, DELETE por id) siguiendo exactamente ese patrón, incluyendo el
try/catch en cada endpoint y la validación del PUT (que el id de la URL coincida con
el del body si el body lo trae).

Después decime qué línea tengo que agregar en server.js para montar el controller
en /api/materias.

Restricciones: usá StatusCodes (no números mágicos), 201 en el POST, 404 cuando no
existe, 400 en error de input. No agregues dependencias.
```

## Qué debería devolver la IA (respuesta modelo)

- `materias-controller.js`: un `Router` con los 5 endpoints, `try/catch`, `StatusCodes.OK/CREATED/NOT_FOUND/BAD_REQUEST`, y la validación URL-vs-body en el `PUT`.
- Y la línea para `server.js`:

```js
import MateriasController from "./controllers/materias-controller.js"
// ...
app.use("/api/materias", MateriasController);
```

## Para comparar con el alumno

- ✅ ¿El POST devuelve **201** (no 200)?
- ✅ ¿Está la validación del **PUT** (id URL vs body)?
- ✅ ¿Registró el controller en `server.js`?
- ✅ ¿Probó los 5 endpoints en Postman (incluyendo 404 y 400)?

> 💡 Hasta acá todo salió "limpio". En la realidad la IA casi siempre mete **algún** detalle mal. El `prompt 04` muestra ese caso —y, sobre todo, **cómo el alumno lo detecta y lo corrige**, que es lo que más valoramos.
