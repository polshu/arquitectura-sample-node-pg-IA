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

`src/controllers/materias-controller.js` completo (espejo de `cursos-controller.js`):

```js
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import MateriasService from './../services/materias-service.js';

const router = Router();
const currentService = new MateriasService();

router.get('', async (req, res) => {
    try {
        const returnArray = await currentService.getAllAsync();
        if (returnArray != null) {
            res.status(StatusCodes.OK).json(returnArray);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error interno.`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

router.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const returnEntity = await currentService.getByIdAsync(id);
        if (returnEntity != null) {
            res.status(StatusCodes.OK).json(returnEntity);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontro la entidad (id:${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

router.post('', async (req, res) => {
    try {
        let entity = req.body;
        const newId = await currentService.createAsync(entity);
        if (newId > 0) {
            res.status(StatusCodes.CREATED).json(newId);
        } else {
            res.status(StatusCodes.BAD_REQUEST).json(null);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
    }
});

router.put('/:id', async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        let entity = req.body;

        if (entity.id && parseInt(entity.id) !== id) {
            return res.status(StatusCodes.BAD_REQUEST).send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
        }

        entity.id = id;
        const rowsAffected = await currentService.updateAsync(entity);
        if (rowsAffected != 0) {
            res.status(StatusCodes.OK).json(rowsAffected);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontro la entidad (id:${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const rowCount = await currentService.deleteByIdAsync(id);
        if (rowCount != 0) {
            res.status(StatusCodes.OK).json(null);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontro la entidad (id:${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

export default router;
```

Y la línea para montar el controller en `src/server.js`:

```js
import MateriasController from "./controllers/materias-controller.js"
// ...junto a los otros app.use:
app.use("/api/materias", MateriasController);
```

## Para comparar con el alumno

- ✅ ¿El POST devuelve **201** (no 200)?
- ✅ ¿Está la validación del **PUT** (id URL vs body)?
- ✅ ¿Registró el controller en `server.js`?
- ✅ ¿Probó los 5 endpoints en Postman (incluyendo 404 y 400)?

> 💡 Hasta acá todo salió "limpio". En la realidad la IA casi siempre mete **algún** detalle mal. El `prompt 04` muestra ese caso —y, sobre todo, **cómo el alumno lo detecta y lo corrige**, que es lo que más valoramos.
