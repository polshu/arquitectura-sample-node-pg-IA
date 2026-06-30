# Ejercicio 04 — Prompt 03: implementación (solución modelo) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Tercer paso: implementar la validación en el service, con los 4 códigos de error bien distinguidos.

---

## El prompt

```
Implementá la validación en el SERVICE (donde ya está validarCursoExiste).

Caso: calificaciones. Reglas:
- nota: entero entre 0 y 10. Si no, error de CLIENTE (400).
- id_alumno e id_materia tienen que existir → validalos REUTILIZANDO AlumnosService y
  MateriasService (como validarCursoExiste usa CursosService). Si no existen, 400.
- no puede repetirse la combinación alumno+materia. Si ya existe, eso es 409 (Conflict).

Requisitos:
- Distinguí 4xx (culpa del cliente) de 5xx (error inesperado del servidor). Un body
  inválido NUNCA es 500.
- El cliente NO debe ver el error.message crudo de PostgreSQL (solo mensajes nuestros).
- No rompas validarCursoExiste. No agregues dependencias.
```

## Qué debería devolver la IA (respuesta modelo)

**El service** tira errores con un `status` asociado:

```js
// calificaciones-service.js
import { StatusCodes } from 'http-status-codes';

export default class CalificacionesService {
    constructor() {
        this.CalificacionesRepository = new CalificacionesRepository();
        this.AlumnosService  = new AlumnosService();
        this.MateriasService = new MateriasService();
    }

    createAsync = async (entity) => {
        // 1) Input inválido → 400 (culpa del cliente)
        if (!Number.isInteger(entity?.nota) || entity.nota < 0 || entity.nota > 10) {
            throw this.error(StatusCodes.BAD_REQUEST, 'La nota debe ser un entero entre 0 y 10.');
        }
        // 2) Las FKs tienen que existir (reutilizo services) → 400
        if (await this.AlumnosService.getByIdAsync(entity.id_alumno) == null) {
            throw this.error(StatusCodes.BAD_REQUEST, `El alumno ${entity.id_alumno} no existe.`);
        }
        if (await this.MateriasService.getByIdAsync(entity.id_materia) == null) {
            throw this.error(StatusCodes.BAD_REQUEST, `La materia ${entity.id_materia} no existe.`);
        }
        // 3) Duplicado → 409 Conflict
        const yaExiste = await this.CalificacionesRepository
            .getByAlumnoYMateriaAsync(entity.id_alumno, entity.id_materia);
        if (yaExiste != null) {
            throw this.error(StatusCodes.CONFLICT,
                `Ya existe una calificación del alumno ${entity.id_alumno} en la materia ${entity.id_materia}.`);
        }
        return await this.CalificacionesRepository.createAsync(entity);
    }

    // helper: crea un Error con un status HTTP asociado
    error = (status, message) => {
        const e = new Error(message);
        e.status = status;
        return e;
    }
}
```

**El controller** traduce el status y NO filtra errores de pg:

```js
router.post('', async (req, res) => {
    try {
        const newId = await currentService.createAsync(req.body);
        res.status(StatusCodes.CREATED).json(newId);
    } catch (error) {
        if (error.status) {
            // error de validación controlado por nosotros → status + mensaje propio
            res.status(error.status).json({ error: error.message });
        } else {
            // error inesperado (ej. pg) → 500 genérico, sin filtrar detalles internos
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error interno.' });
        }
    }
});
```

> El `error.status` es **una** forma limpia de pasar el código del service al controller. Hay otras (clases de error propias, etc.); cualquiera vale si distingue 4xx de 5xx y no filtra pg.

## Para comparar con el alumno

- ✅ `nota:99` → **400**; alumno/materia inexistente → **400**; duplicado → **409**; error de pg → **500 genérico**.
- ✅ La validación de FKs **reutiliza** los services (no va directo al repository).
- ✅ El cliente nunca ve el `error.message` crudo de PostgreSQL.
- ✅ No se rompió `validarCursoExiste` ni se agregaron dependencias (o se justificó zod).
