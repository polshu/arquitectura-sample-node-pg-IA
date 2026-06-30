// ============================================================================
// USO DOCENTE — Solución de referencia del Ejercicio 03 (helper de fechas)
// ----------------------------------------------------------------------------
// Destino real en el proyecto: src/helpers/fechas-helper.js
//
// Segundo candidato a extraer del ejercicio 03. Hoy `calcularEdad` y
// `agregarEdad` viven como funciones sueltas DENTRO de alumnos-service.js.
// El problema: el cálculo de edad a partir de una fecha NO es lógica de negocio
// de "alumnos" — es una utilidad de fechas reutilizable (mañana la podrían usar
// docentes, inscripciones, etc.). Por eso se lleva a un helper independiente.
//
// Igual que respuestas-helper: son funciones SIN estado → van como funciones
// sueltas, no como clase.
// ============================================================================

// Calcula la edad (en años) a partir de una fecha de nacimiento.
// Devuelve null si no hay fecha. La lógica es IDÉNTICA a la que estaba en el
// service: resta los años y descuenta 1 si todavía no cumplió en el año actual.
export const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy        = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let   edad       = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff    = hoy.getMonth() - nacimiento.getMonth();
    // Si todavía no llegó el mes/día del cumpleaños este año, resto 1.
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

// Devuelve una COPIA del alumno con la propiedad `edad` agregada.
// No muta el objeto original (usa spread). Si el alumno es null, lo devuelve tal cual.
export const agregarEdad = (alumno) => {
    if (!alumno) return alumno;
    return { ...alumno, edad: calcularEdad(alumno.fecha_nacimiento) };
};


// ----------------------------------------------------------------------------
// Cómo queda alumnos-service.js después de extraer el helper:
//
//   import { agregarEdad } from '../helpers/fechas-helper.js';
//
//   getAllAsync = async () => {
//       const returnArray = await this.AlumnosRepository.getAllAsync();
//       if (returnArray == null) return null;
//       return returnArray.map(alumno => agregarEdad(alumno));
//   };
//
//   getByIdAsync = async (id) => {
//       const returnEntity = await this.AlumnosRepository.getByIdAsync(id);
//       return agregarEdad(returnEntity);   // misma regla, ahora desde el helper
//   };
//
// Variante con import de namespace (equivalente, sin crear una clase):
//   import * as fechas from '../helpers/fechas-helper.js';
//   return fechas.agregarEdad(returnEntity);
//
// Verificación: la edad de cada alumno tiene que dar EXACTAMENTE el mismo número
// que antes de mover el código (el GET /api/alumnos no cambia su respuesta).
// ----------------------------------------------------------------------------
