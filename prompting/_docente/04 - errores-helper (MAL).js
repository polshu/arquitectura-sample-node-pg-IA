// ============================================================================
// USO DOCENTE — Ejercicio 04: la versión MAL (anti-ejemplo) ❌
// ----------------------------------------------------------------------------
// Esto es lo que la IA suele devolver y "parece andar": valida los casos, pero
// con los códigos de error MAL puestos y filtrando el error crudo de pg.
// Compará con la versión correcta: `04 - errores-helper.js`.
//
// El alumno tiene que DETECTAR estos 3 errores probando los casos de error en
// Postman (no solo el happy path) y mirando el status + el body de la respuesta.
// ============================================================================

import { StatusCodes } from 'http-status-codes';


// --- ERROR 1: tirar el Error "pelado", sin status -----------------------------
// Sin .status el controller no lo sabe traducir y lo termina mandando como 500.
// Pero una nota fuera de rango es culpa del CLIENTE → tendría que ser 400.
//
//   if (entity.nota < 0 || entity.nota > 10)
//       throw new Error('Nota inválida');     // ❌ el controller lo manda como 500
//
// ✔ Correcto: throw errorBadRequest('La nota debe ser un entero entre 0 y 10.');  // 400


// --- ERROR 2: usar 400 para un duplicado --------------------------------------
// "Ya existe" no es un input inválido, es un CONFLICTO con el estado actual.
// La tabla tiene UNIQUE(id_alumno, id_materia) → eso es 409, no 400.
export const errorDuplicado = (mensaje) =>
    crearError(StatusCodes.BAD_REQUEST, mensaje);   // ❌ debería ser StatusCodes.CONFLICT (409)


export const crearError = (status, mensaje) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};


// --- ERROR 3: el catch responde 500 para todo y FILTRA el error de pg ---------
// Le manda al cliente el error.message crudo de PostgreSQL, que expone la
// estructura interna de la base (nombres de tablas, constraints, columnas).
// Ej. el cliente llega a ver:
//   "duplicate key value violates unique constraint \"calificaciones_alumno_materia_key\""
export const manejarError = (res, error) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)   // ❌ 500 para TODO, ignora error.status
       .send(`Error: ${error.message}`);            // ❌ filtra el detalle interno de pg
};


// ----------------------------------------------------------------------------
// Síntomas al probar en Postman (status esperado vs. real):
//   POST nota: 99        → da 500   (debería ser 400)  ❌
//   POST duplicado       → da 400   (debería ser 409)  ❌
//   error de base        → el cliente ve texto crudo de PostgreSQL  ❌
//
// La corrección está en `04 - errores-helper.js`:
//   - cada validación tira su status correcto (400 input / 409 conflicto),
//   - manejarError respeta error.status para los errores nuestros, y
//   - responde 500 GENÉRICO ("Error interno.") para lo inesperado, sin filtrar pg.
// ----------------------------------------------------------------------------
