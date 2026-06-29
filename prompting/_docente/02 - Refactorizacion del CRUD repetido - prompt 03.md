# Ejercicio 02 — Prompt 03: la corrección (la IA se llevó puesta la regla de negocio) ✅🔍

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** El paso que más mide criterio: la IA sobre-refactorizó y rompió algo. ¿El alumno lo detecta?

---

## Lo que la IA hizo MAL

Entusiasmada con el "no repitas código", la IA **fue más allá de lo pedido** y también genericó los **services**: creó un `BaseService` y dejó `AlumnosService` como un pass-through genérico... **perdiendo la lógica propia de alumnos**:

```js
// ❌ alumnos-service.js "genérico" que devolvió la IA
export default class AlumnosService extends BaseService {
    constructor() {
        super(new AlumnosRepository());
    }
    // ...y nada más. Se perdieron agregarEdad() y validarCursoExiste().
}
```

Funciona (los endpoints responden), pero ahora:

- `GET /api/alumnos/1` **ya no trae el campo `edad`**.
- `POST /api/alumnos` con `id_curso: 999` (un curso que no existe) **ya no tira el error de validación** — inserta o rompe con un error feo de PostgreSQL.

## Cómo lo detecta el alumno

- Prueba en Postman **antes y después** (como pide la verificación) y nota que la respuesta de alumnos **cambió**: falta `edad`.
- O revisa el `git diff` y ve que `agregarEdad` y `validarCursoExiste` **desaparecieron**.

## El prompt de corrección

```
Pará: el refactor del service rompió la lógica de negocio de alumnos. Antes
AlumnosService calculaba la edad (agregarEdad) en los GET y validaba que el curso
existiera (validarCursoExiste) en create y update. Tu versión genérica eliminó eso,
y ahora el GET de alumnos no devuelve "edad" y el POST con un id_curso inexistente
no valida nada.

Volvé atrás SOLO en el service: dejá AlumnosService con su lógica original
(agregarEdad y validarCursoExiste) intacta. El refactor de eliminación de duplicación
tiene que quedar SOLO en los repositories (BaseRepository), como habíamos acordado.
No toques los services.
```

## Por qué este prompt es el que más vale

- El alumno **verificó** (no confió) y **detectó una regresión** real de comportamiento.
- Entiende **dónde vive** la lógica de negocio (en el service de alumnos, no en el repository) y por qué no debía tocarse.
- La corrección es **quirúrgica**: revertí solo el service, mantené el refactor de repositories.

## Para comparar con el alumno

- 🟢 **Ideal**: nota que la regla de negocio se perdió y la recupera. Esto es exactamente el ítem de verificación *"la regla de negocio de alumnos no se perdió en el refactor"*.
- 🟡 Si dice "todo bien, no rompí nada" → pedile en vivo: *"hacé `GET /api/alumnos/1`, ¿ves el campo `edad`?"*. Si no está, no verificó.
- 🔴 Si no sabe explicar **por qué** el `edad` se calcula en el service y no en el repository → no entendió las capas (engancha con el ejercicio 06).

> 🤔 Pregunta de cierre: *"¿hasta dónde tenía que llegar el refactor y dónde se pasó la IA? ¿cómo te diste cuenta?"*
