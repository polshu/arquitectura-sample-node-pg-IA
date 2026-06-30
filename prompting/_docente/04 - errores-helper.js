// ============================================================================
// USO DOCENTE — Solución de referencia del Ejercicio 04 (validaciones / errores)
// ----------------------------------------------------------------------------
// Destino real en el proyecto: src/helpers/errores-helper.js
//
// El ejercicio 03 extrajo el FORMATO de la respuesta (responderOk/NotFound/Error).
// El ejercicio 04 ataca otra cosa: QUÉ código de error corresponde a cada caso
// (400 input inválido, 404 no encontrado, 409 conflicto, 500 inesperado) y cómo
// llevar esa decisión desde el SERVICE (donde vive la regla de negocio) hasta el
// CONTROLLER (que arma la respuesta HTTP) sin filtrar el error crudo de pg.
//
// Dos piezas reutilizables:
//   1) crearError(status, mensaje) → un Error "controlado" con su status HTTP.
//      Lo TIRA el service (igual idea que validarCursoExiste).
//   2) manejarError(res, error)    → el catch del controller. Si el error es
//      nuestro (tiene .status) responde con ESE status y nuestro mensaje; si es
//      inesperado (ej. PostgreSQL) responde 500 genérico SIN exponer detalles.
// ============================================================================

import { StatusCodes } from 'http-status-codes';

// --- 1) Para el SERVICE: crear errores con un status HTTP asociado -----------
//
// En vez de `throw new Error('...')` (que el controller no sabe traducir y
// termina mandando como 500), el service tira errores que llevan su código:
//
//   if (!Number.isInteger(nota) || nota < 0 || nota > 10)
//       throw crearError(StatusCodes.BAD_REQUEST, 'La nota debe ser un entero entre 0 y 10.');
//
//   if (yaExiste)
//       throw crearError(StatusCodes.CONFLICT, 'Ya existe esa calificación.');
//
export const crearError = (status, mensaje) => {
    const error = new Error(mensaje);
    error.status = status;          // marca que es un error "nuestro", controlado
    return error;
};

// Atajos opcionales para los 4 códigos del ejercicio (más legibles en el service).
export const errorBadRequest = (mensaje) => crearError(StatusCodes.BAD_REQUEST, mensaje); // 400
export const errorNotFound   = (mensaje) => crearError(StatusCodes.NOT_FOUND, mensaje);   // 404
export const errorConflict   = (mensaje) => crearError(StatusCodes.CONFLICT, mensaje);    // 409


// --- 2) Para el CONTROLLER: traducir el error en una respuesta HTTP ----------
//
// Reemplaza el catch escrito a mano de cada endpoint. La clave es distinguir:
//   - error.status presente  → lo pusimos nosotros (validación): 4xx con mensaje propio.
//   - error.status ausente    → inesperado (pg, bug): 500 GENÉRICO, sin filtrar nada.
//
//   router.post('', async (req, res) => {
//       try {
//           const newId = await currentService.createAsync(req.body);
//           res.status(StatusCodes.CREATED).json(newId);
//       } catch (error) {
//           manejarError(res, error);
//       }
//   });
//
export const manejarError = (res, error) => {
    if (error.status) {
        // Error de validación controlado por nosotros → status correcto + mensaje propio.
        res.status(error.status).json({ error: error.message });
    } else {
        // Error inesperado (ej. PostgreSQL): NO se lo mostramos al cliente.
        // Lo logueamos para nosotros y respondemos un 500 genérico.
        // (Si ya hiciste el ejercicio 03, acá podrías usar LogHelper en vez de console.log.)
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error interno.' });
    }
};


// ----------------------------------------------------------------------------
// Cómo encaja con el SERVICE (los 4 códigos bien distinguidos):
//
//   import { errorBadRequest, errorConflict } from '../helpers/errores-helper.js';
//
//   createAsync = async (entity) => {
//       // 1) input inválido → 400 (culpa del cliente, NUNCA 500)
//       if (!Number.isInteger(entity?.nota) || entity.nota < 0 || entity.nota > 10)
//           throw errorBadRequest('La nota debe ser un entero entre 0 y 10.');
//
//       // 2) FKs: se validan REUTILIZANDO los services (como validarCursoExiste) → 400
//       if (await this.AlumnosService.getByIdAsync(entity.id_alumno) == null)
//           throw errorBadRequest(`El alumno ${entity.id_alumno} no existe.`);
//
//       // 3) duplicado (UNIQUE alumno+materia) → 409 Conflict, no 400
//       const yaExiste = await this.Repository
//           .getByAlumnoYMateriaAsync(entity.id_alumno, entity.id_materia);
//       if (yaExiste != null)
//           throw errorConflict(`Ya existe una calificación del alumno ${entity.id_alumno} en esa materia.`);
//
//       return await this.Repository.createAsync(entity);
//   };
//
// Casos de prueba (Postman) que deben pasar:
//   nota: 99            → 400      |  alumno/materia inexistente → 400
//   duplicado          → 409      |  error de pg                → 500 "Error interno." (sin texto crudo)
// ----------------------------------------------------------------------------
//
// Variante: import de namespace (todo el helper bajo un solo nombre).
// Es lo MISMO que importar funciones sueltas, pero las agrupás con un prefijo
// (`errores.crearError`, `errores.manejarError`). Útil si querés que se lea como
// si fuera una "clase de utilidades", pero SIN crear una clase (no hace falta:
// son funciones sin estado). En este TP cualquiera de las dos formas es válida.
//
//   import * as errores from '../helpers/errores-helper.js';
//
//   // en el service:
//   throw errores.errorBadRequest('La nota debe ser un entero entre 0 y 10.');
//   throw errores.errorConflict('Ya existe esa calificación.');
//
//   // en el controller:
//   catch (error) { errores.manejarError(res, error); }
// ----------------------------------------------------------------------------
