// ============================================================================
// USO DOCENTE — Solución de referencia del Ejercicio 03 (helper de respuestas)
// ----------------------------------------------------------------------------
// Destino real en el proyecto: src/helpers/respuestas-helper.js
//
// Este helper extrae el patrón que hoy se repite endpoint por endpoint en los
// controllers (alumnos, cursos, materias...): el res.status(...).send/json(...).
//
// ¿Por qué FUNCIONES y no una CLASE?
//   Las respuestas HTTP NO guardan estado: cada llamada recibe (res, data) y
//   termina. No hay nada que "recordar" entre llamadas. Por eso van como
//   funciones puras sueltas. Una clase se justifica cuando hay estado/config,
//   como LogHelper (lee el .env en su constructor) o DbPg (sostiene el Pool).
// ============================================================================

import { StatusCodes } from 'http-status-codes';

// 200 OK — devuelve un recurso o una lista en formato JSON.
export const responderOk = (res, data) =>
    res.status(StatusCodes.OK).json(data);

// 201 CREATED — se creó un recurso nuevo (lo usa, por ejemplo, el POST).
export const responderCreado = (res, data) =>
    res.status(StatusCodes.CREATED).json(data);

// 404 NOT FOUND — no existe el recurso pedido. Se manda como texto plano,
// igual que hoy lo hace cada endpoint a mano.
export const responderNotFound = (res, mensaje) =>
    res.status(StatusCodes.NOT_FOUND).send(mensaje);

// 400 BAD REQUEST — el input del cliente es inválido (body vacío, tipo erroneo).
// OJO: varios endpoints (POST/PUT) hoy responden 400 en su catch, NO 500.
// Por eso existe este helper aparte: si en esos endpoints usás responderError
// (que devuelve 500) estarías cambiando el status original 400 -> 500.
export const responderBadRequest = (res, mensaje) =>
    res.status(StatusCodes.BAD_REQUEST).send(mensaje);

// 500 INTERNAL SERVER ERROR — error inesperado del servidor.
// Mantiene EXACTAMENTE el mismo formato que hoy: `Error: ${error.message}`.
// (En el ejercicio 09 vas a ver que filtrar error.message crudo puede exponer
//  detalles internos de la base; por ahora respetamos el comportamiento actual.)
export const responderError = (res, error) =>
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);


// ----------------------------------------------------------------------------
// Cómo queda UN endpoint usando el helper (mismo status y mismo body que antes):
//
//   import { responderOk, responderNotFound, responderError }
//       from '../helpers/respuestas-helper.js';
//
//   router.get('/:id', async (req, res) => {
//       try {
//           const entity = await currentService.getByIdAsync(req.params.id);
//           if (entity != null) responderOk(res, entity);
//           else                responderNotFound(res, `No se encontro la entidad (id:${req.params.id}).`);
//       } catch (error) {
//           console.log(error);
//           responderError(res, error);
//       }
//   });
// ----------------------------------------------------------------------------
//
// Variante: import de namespace (todo el helper bajo un solo nombre).
// Es lo MISMO que importar funciones sueltas, pero las agrupás con un prefijo
// (`respuestas.ok`, `respuestas.notFound`). Útil si querés que se lea como si
// fuera una "clase de utilidades", pero SIN crear una clase (no hace falta:
// son funciones sin estado). En este TP cualquiera de las dos formas es válida.
//
//   import * as respuestas from '../helpers/respuestas-helper.js';
//
//   if (entity != null) respuestas.responderOk(res, entity);
//   else                respuestas.responderNotFound(res, `No se encontro la entidad (id:${req.params.id}).`);
// ----------------------------------------------------------------------------
