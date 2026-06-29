# Ejercicio 02 — Prompt 01: diagnóstico (NO pedir código todavía) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Primer prompt bueno: entender la duplicación y evaluar estrategias antes de tocar nada.

---

## El prompt

```
Actuá como un desarrollador backend senior, experto en refactorización.

Contexto: tengo una API Express 5 (ES modules, arquitectura en capas) con varios
repositories que hacen CRUD contra PostgreSQL a través de una clase helper `DbPg`
(this.db, métodos queryAll/queryOne/queryReturnId/queryRowCount, queries con $1).
Te pego dos repositories que se parecen mucho:

--- alumnos-repository.js ---
[PEGÁS EL ARCHIVO]

--- cursos-repository.js ---
[PEGÁS EL ARCHIVO]

Tarea: NO escribas código todavía. Quiero que (1) identifiques exactamente qué
código está duplicado entre los dos, y (2) me propongas 2 o 3 estrategias para
eliminar esa duplicación, con pros y contras de cada una, pensadas para un proyecto
educativo chico (sin sobre-ingeniería).

Restricción para las propuestas: seguir usando `pg` con SQL crudo y la clase `DbPg`,
sin introducir un ORM.
```

## Las 5 partes EFSI

- **Rol**: backend senior experto en refactorización.
- **Contexto**: stack + `DbPg` + **pega los dos repositories**.
- **Tarea**: diagnóstico — identificar duplicación + 2-3 estrategias con pros/cons. **Sin código.**
- **Restricciones**: sin ORM, seguir con `pg`/`DbPg`, proporcional a un proyecto chico.
- **Iteración**: el "no escribas código todavía" es justamente la iteración (después viene la ejecución).

---

## Qué debería devolver la IA (respuesta modelo)

Una identificación de la duplicación (`getAllAsync`, `getByIdAsync`, `deleteByIdAsync` son idénticos salvo el nombre de tabla) y algo como:

| Estrategia | Pro | Contra |
|---|---|---|
| **A) `BaseRepository` por herencia** ("es un", tabla como parámetro) | Simple, clásico, fácil de entender | Acopla las entidades a una clase base |
| **B) Composición** ("tiene un": el repo tiene adentro un `GenericRepository` parametrizado con su tabla y le delega) | Sin herencia, más flexible | Hay que delegar cada método común |
| **C) Mixin / helper de queries** | Flexible | Puede quedar "mágico" |

> Para este proyecto, **A** suele ser la más proporcional. Pero la decisión es del alumno.

## Para comparar con el alumno

- ✅ ¿Hizo un prompt de **diagnóstico** antes de pedir código? Es lo que separa este ejercicio de "refactorizá todo".
- ✅ ¿Le puso la restricción de **no ORM** ya en el diagnóstico?
- 🤔 Oral: *"¿qué estrategias te ofreció y por qué elegiste esa? ¿cuál descartaste y por qué?"*
