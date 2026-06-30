# Ejercicio 04 — Prompt 04: la corrección (los códigos de error mal puestos) ✅🔍

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** El paso que mide criterio: la IA validó, pero puso mal los status codes. ¿El alumno los distingue?

---

## Lo que salió MAL

La implementación de la IA validó los casos, pero con **status codes equivocados** (el error más común del ejercicio):

```js
// ❌ Todo lo que falla lo tira como un Error "pelado", sin status.
if (entity.nota < 0 || entity.nota > 10) {
    throw new Error('Nota inválida');         // el controller lo termina mandando como 500
}
// ❌ Y el duplicado lo trata como 400 en vez de 409.
if (yaExiste) {
    throw this.error(StatusCodes.BAD_REQUEST, 'Ya existe.');   // debería ser 409
}
```

Y/o el controller manda el `error.message` crudo:

```js
} catch (error) {
    res.status(500).send(`Error: ${error.message}`);   // ❌ 500 para todo + filtra el error de pg
}
```

Resultado tras probar en Postman:

- `POST` con `nota: 99` → devuelve **500** (debería ser **400**).
- `POST` duplicado → devuelve **400** (debería ser **409**).
- Un error de base → el cliente ve `error: duplicate key value violates unique constraint "calificaciones_..."` (**filtra** la estructura de la base).

## Cómo lo detecta el alumno

Probando los **casos de error** (no solo el happy path) y mirando el **status** y el **body** de cada respuesta:

- nota inválida da 500 en vez de 400.
- el duplicado da 400 en vez de 409.
- el mensaje de error muestra texto de PostgreSQL.

## El prompt de corrección

```
Los status codes quedaron mal:
1) Una nota fuera de rango devuelve 500, pero es culpa del cliente → tiene que ser 400.
2) El duplicado devuelve 400, pero "ya existe" es un conflicto → tiene que ser 409.
3) Cuando hay un error inesperado, el cliente ve el mensaje crudo de PostgreSQL.

Corregí: que cada error de validación lleve su status correcto (400 para input
inválido, 409 para duplicado) y que el controller use ESE status. Para los errores
inesperados (los que no pusimos nosotros), responder 500 con un mensaje genérico, sin
exponer el error.message de pg. No cambies la lógica de validación, solo los códigos
y el mensaje al cliente.
```

## Por qué este prompt es el que más vale

- El alumno **probó los casos de error** y comparó status esperado vs real.
- Distingue **4xx (cliente) de 5xx (servidor)** y sabe que **409 ≠ 400** (conflicto vs input inválido).
- Entiende que **filtrar `error.message` de pg es un problema de seguridad** (se cruza con el ejercicio 09).

## Para comparar con el alumno

- 🟢 **Ideal**: detecta los status mal puestos y la fuga de info, y los corrige.
- 🟡 Si "anda todo" pero solo probó el happy path → pedile en vivo: *"mandá un POST con nota 99, ¿qué status te da? ¿y un duplicado?"*.
- 🔴 Si no sabe por qué un duplicado es 409 y no 400, o por qué no hay que mostrar el error de pg → no entendió el objetivo del ejercicio.

> 🤔 Pregunta de cierre: *"decime un caso para cada código: 400, 404, 409, 500. ¿Por qué cada uno es ese y no otro?"*
