// ============================================================================
// USO DOCENTE — Solución de referencia del Ejercicio 04 (helper de validación de id)
// ----------------------------------------------------------------------------
// Destino real en el proyecto: src/helpers/validaciones-helper.js
//
// PROBLEMA QUE RESUELVE (el disparador del ejercicio):
// Hoy los controllers tratan el `id` de la URL de tres formas distintas:
//
//   GET /:id     →  let id = req.params.id;            // STRING (va directo al SQL)
//   DELETE /:id  →  let id = req.params.id;            // STRING
//   PUT /:id     →  let id = parseInt(req.params.id);  // NÚMERO (lo compara con el body)
//
// Funciona, pero el criterio quedó INCONSISTENTE y nadie valida que el `id`
// sea realmente un número → `GET /api/alumnos/abc` puede tirar un 500 críptico.
//
// SOLUCIÓN: un único helper que VALIDA + CONVIERTE, usado igual en los 3 endpoints.
// Se apoya en el errores-helper del mismo ejercicio (tira un 400 controlado).
// ============================================================================

import { errorBadRequest } from './errores-helper.js';

// Valida que el id sea un entero positivo y lo devuelve convertido a número.
// Si no es válido, tira un error 400 (lo agarra el manejarError del controller).
//
// Decisión de diseño: TIRA un error en vez de devolver null, para quedar
// consistente con el patrón de errores del ejercicio 04 (crearError + manejarError).
// Así el endpoint queda en una sola línea, sin un `if (id == null)` extra.
export const parsearId = (idRaw) => {
    const id = parseInt(idRaw, 10);
    // Number.isNaN cubre "abc", ""  ·  id <= 0 cubre 0 y negativos (no hay id 0).
    if (Number.isNaN(id) || id <= 0) {
        throw errorBadRequest(`El id "${idRaw}" no es válido: tiene que ser un número entero positivo.`);
    }
    return id;
};


// ----------------------------------------------------------------------------
// Cómo quedan los 3 endpoints DESPUÉS (mismo criterio en los tres):
//
//   import { parsearId } from '../helpers/validaciones-helper.js';
//
//   router.get('/:id', async (req, res) => {
//       try {
//           const id = parsearId(req.params.id);          // valida + convierte
//           const entity = await currentService.getByIdAsync(id);
//           ...
//       } catch (error) { manejarError(res, error); }      // id inválido → 400
//   });
//
//   router.put('/:id', async (req, res) => {
//       try {
//           const id = parsearId(req.params.id);           // ya es número: la comparación
//           if (req.body.id && parsearId(req.body.id) !== id)   // con el body es limpia
//               throw errorBadRequest(`El id de la URL (${id}) no coincide con el del body.`);
//           ...
//       } catch (error) { manejarError(res, error); }
//   });
//
//   // DELETE /:id  → idéntico: const id = parsearId(req.params.id);
//
// Resultado: ya no hay un endpoint con parseInt y otro sin él. El "qué es un id
// válido" vive en UN solo lugar.
// ----------------------------------------------------------------------------
//
// Variante con import de namespace (equivalente, sin crear una clase):
//   import * as validaciones from '../helpers/validaciones-helper.js';
//   const id = validaciones.parsearId(req.params.id);
// ----------------------------------------------------------------------------
//
// 🤔 PARA EL ORAL — qué escuchar:
//   - ¿Por qué antes el PUT hacía parseInt y el GET no? → el PUT COMPARA en JS
//     (parseInt(entity.id) !== id); el GET/DELETE solo pasan el id al SQL, que
//     castea solo. El helper unifica el criterio para los tres.
//   - ¿400 o 404 para un id no numérico? Las dos se defienden. Acá elegimos 400
//     ("el formato del id es inválido"). 404 sería "no existe ese recurso" — pero
//     "abc" ni siquiera es un id válido para buscar. Lo importante: que NO sea 500.
//   - 🔴 Señal mala: deja el 500, o "valida" en cada endpoint copiando el parseInt
//     (no extrajo el helper, solo movió el problema).
// ----------------------------------------------------------------------------
