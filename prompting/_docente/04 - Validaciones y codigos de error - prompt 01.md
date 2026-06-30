# Ejercicio 04 — Prompt 01: auditoría (ver los agujeros antes de tapar) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Primer prompt bueno: mapear qué pasa hoy con cada input, sin escribir código.

---

## El prompt

```
Actuá como un desarrollador backend senior, obsesivo con los casos borde.

Contexto: API Express 5 (capas, pg sin ORM). Hoy casi no hay validación de input: el
body del request pasa directo al service y al repository. La única validación de
negocio es validarCursoExiste, que reutiliza otro service. Te pego el controller, el
service y el repository de alumnos (y, si lo hice, el de calificaciones):

[PEGÁS LOS ARCHIVOS]

Tarea: NO escribas código. Hacé una tabla de TODOS los inputs que el usuario puede
mandar (por endpoint) y, para cada uno, qué pasa HOY si viene: vacío, con tipo
incorrecto, fuera de rango, o malicioso. Marcá qué status code se termina devolviendo
y si es el correcto.
```

## Las 5 partes EFSI

- **Rol**: backend senior **obsesivo con casos borde**.
- **Contexto**: el estado actual + `validarCursoExiste` como patrón + **pega los archivos**.
- **Tarea**: auditoría en tabla (input → qué pasa hoy → status). **Sin código.**
- **Restricciones**: implícitas (marcar si el status es el correcto).
- **Iteración**: "no escribas código".

---

## Qué debería devolver la IA (respuesta modelo, resumida)

| Input | Hoy | ¿Correcto? |
|---|---|---|
| `POST alumnos {}` (vacío) | inserta con `nombre=''`, devuelve 201 | ❌ debería ser 400 |
| `POST alumnos id_curso:"hola"` | explota la query → 400/500 según caso | ⚠️ debería ser 400 claro |
| `GET alumnos/abc` (id no numérico) | la query falla → 500 críptico | ❌ debería ser 400 |
| `POST calificaciones nota:99` | inserta una nota inválida | ❌ debería ser 400 |
| `POST calificaciones` duplicado | rompe por `UNIQUE` → error feo | ❌ debería ser 409 |
| cualquier error | devuelve `error.message` crudo de pg | ❌ filtra info interna |

## Para comparar con el alumno

- ✅ ¿Audita **antes** de pedir código?
- ✅ ¿Detectó que hoy un body inválido puede terminar en **201** (se inserta basura) o en **500** (cuando debería ser 400)?
- 🤔 Oral: *"¿cuál fue el agujero que más te sorprendió de los que ya tenía la API?"*
