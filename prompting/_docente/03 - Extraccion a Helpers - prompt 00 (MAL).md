# Ejercicio 03 — Prompt 00: lo que está MAL ❌

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Ejemplo de un prompt de extracción a helpers mal encarado.

---

## El prompt malo

```
sacá todo el código repetido de los controllers y metelo en helpers
```

---

## Por qué está mal

- **Sin diagnóstico.** No piensa qué conviene extraer y qué no; deja que la IA decida y haga todo de una.
- **Sin contexto.** No pega los controllers → la IA no ve el código real ni la convención del proyecto (`LogHelper`).
- **Sin restricciones.** No dice lo más importante: **"la respuesta HTTP no debe cambiar"**. Sin eso, la IA "unifica" y rompe status codes.
- **"todo de una"** → imposible de revisar helper por helper.

---

## Qué te va a devolver la IA (y por qué es un problema)

Lo más típico: te arma un **`asyncHandler`** (un wrapper que envuelve cada endpoint y centraliza el try/catch) **+** helpers de respuesta, todo junto. Se ve elegante, pero:

- El wrapper suele responder **500 para cualquier error**. Pero en estos controllers el **POST** y el **PUT** devuelven **400 (Bad Request)** en su `catch`, no 500. Resultado: un body inválido que antes daba **400 ahora da 500**. **Cambió la API** sin que nadie lo note.
- O mueve el "no encontrado" a un `throw` y lo termina respondiendo 500 en vez de **404**.
- O sobre-extrae: crea 6 helpers para ahorrar 3 líneas, y queda más difícil de leer que antes.

> ⚠️ El ejercicio avisa esto explícitamente: *"un wrapper async puede tragarse un status distinto al original"*. El `prompt 03` muestra justo esa regresión y cómo el alumno la detecta.

---

## Señales para el oral

- Si metió un `asyncHandler` y **no probó los casos de error** (POST con body roto, GET de un id inexistente) → 🔴 no verificó que la API siga igual.
- Preguntale: *"con tu helper, ¿qué status devuelve un POST con datos inválidos? ¿el mismo que antes?"* Si no sabe, no comparó.
