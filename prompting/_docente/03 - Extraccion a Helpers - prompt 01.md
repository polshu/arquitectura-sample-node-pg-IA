# Ejercicio 03 — Prompt 01: diagnóstico (qué extraer y qué no) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Primer prompt bueno: identificar candidatos antes de escribir un solo helper.

---

## El prompt

```
Actuá como un desarrollador backend senior, ordenado y conservador con los refactors.

Contexto: API Express 5 (ES modules, capas). Los controllers repiten el mismo patrón
de try/catch + status codes en cada endpoint, y se repite entre entidades. Tengo un
helper ya existente, LogHelper (clase con métodos), como referencia de convención. Te
pego dos controllers:

--- alumnos-controller.js ---
[PEGÁS EL ARCHIVO]

--- cursos-controller.js ---
[PEGÁS EL ARCHIVO]

Tarea: NO escribas código todavía. Identificá qué lógica se repite y listame los
candidatos a extraer a un helper, ORDENADOS por cuánto código ahorran y qué tan
seguro es extraerlos. Para cada candidato, decime qué riesgo tiene (por ejemplo, si
puede cambiar el comportamiento de los endpoints).
```

## Las 5 partes EFSI

- **Rol**: backend senior, **conservador con los refactors** (clave para que no sobre-extraiga).
- **Contexto**: el patrón repetido + **pega los dos controllers** + menciona `LogHelper` como convención.
- **Tarea**: diagnóstico — listar candidatos ordenados + riesgo. **Sin código.**
- **Restricciones**: implícita en "qué tan seguro es extraerlo / qué riesgo tiene".
- **Iteración**: "no escribas código todavía".

---

## Qué debería devolver la IA (respuesta modelo)

Algo como:

| Candidato | Ahorra | Riesgo |
|---|---|---|
| Helper de respuestas (`responderOk/NotFound/Error`) | Medio | **Bajo** — son funciones puras, no cambian el flujo |
| Wrapper `asyncHandler` (saca el try/catch de cada endpoint) | Alto | **Alto** — puede unificar status (POST/PUT usan 400, GET usa 500) |
| Extraer `calcularEdad`/`agregarEdad` a un helper de fechas | Bajo | **Bajo** — `calcularEdad` ya es una función pura |

## Para comparar con el alumno

- ✅ ¿Hizo diagnóstico antes de pedir código?
- ✅ ¿La IA (o el alumno) marcó que el `asyncHandler` es el de **mayor riesgo**? Ese es el punto fino del ejercicio.
- 🤔 Oral: *"de los candidatos, ¿cuál es el más riesgoso y por qué? ¿cuál dejarías para el final?"*
