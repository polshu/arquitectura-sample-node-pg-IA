# Ejercicio 04 — Prompt 02: diseño (¿dónde vive la validación?) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Segundo paso: decidir el patrón antes de implementar.

---

## El prompt

```
Antes de implementar, ayudame a decidir DÓNDE poner la validación en esta
arquitectura en capas. Dame pros y contras de estas opciones, para un proyecto
educativo que NO quiere dependencias pesadas:

1) En el controller (al principio de cada endpoint).
2) En el service (junto a las reglas de negocio, como validarCursoExiste).
3) En un middleware de Express.
4) Con una librería (zod / joi / express-validator).

No escribas la implementación todavía. Quiero elegir con criterio. Tené en cuenta que
ya existe validarCursoExiste en el service como patrón.
```

## Por qué este prompt

- Trata la validación como una **decisión de arquitectura**, no como algo que la IA elige sola.
- Pone el límite "sin dependencias pesadas" para que la recomendación sea **proporcional**.
- Ancla en lo que ya existe (`validarCursoExiste`).

---

## Qué debería devolver la IA (respuesta modelo)

| Dónde | Pro | Contra |
|---|---|---|
| Controller | Cerca del request | Se repite en cada endpoint; mezcla HTTP con reglas |
| **Service** | Junto a `validarCursoExiste`; **consistente**; reutilizable desde cualquier endpoint | Hay que mapear el error a un status en el controller |
| Middleware | Saca la validación del endpoint | Otra capa para un proyecto chico; el "qué es válido" queda lejos de la regla |
| Librería (zod…) | Declarativo, potente | Dependencia nueva + estilo nuevo; sobra para 2-3 tablas |

> Conclusión razonable para este proyecto: **validar en el service** (donde ya vive `validarCursoExiste`), tirando errores con un status asociado, y que el controller los traduzca. Sin librería, salvo que el alumno justifique zod.

## Para comparar con el alumno

- ✅ ¿Eligió un lugar **y lo justificó**, o dejó que la IA decidiera?
- ✅ ¿La elección es **consistente** con `validarCursoExiste`?
- 🤔 Oral: *"si la misma regla la necesitás en el POST y en el PUT, ¿dónde te conviene tenerla y por qué?"*
