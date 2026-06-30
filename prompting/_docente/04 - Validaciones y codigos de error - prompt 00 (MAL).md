# Ejercicio 04 — Prompt 00: lo que está MAL ❌

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Ejemplo de un prompt de validación mal encarado.

---

## El prompt malo

```
validá todo el input de la API
```

---

## Por qué está mal

- **Sin auditoría.** No piensa qué inputs hay ni qué pasa hoy con cada uno. Le pide a la IA que decida y haga todo.
- **Sin contexto.** No pega controller/service/repository → la IA no ve `validarCursoExiste` (el patrón que ya existe y conviene seguir).
- **Sin restricciones.** No dice "no agregues librerías", "distinguí 4xx de 5xx", "no filtres el error de pg". Sin eso, la IA toma las peores decisiones por default.

---

## Qué te va a devolver la IA (y por qué es un problema)

- **Te mete `zod` / `joi` / `express-validator`.** Puede estar bien, pero es una **decisión de arquitectura** (una dependencia nueva, un estilo nuevo) que el alumno tomó sin querer. Si no la puede justificar, es 🟡.
- **Devuelve `500` para todo lo que falla.** Pero un body inválido es **culpa del cliente → 400**. Y un duplicado es **409**. La IA tiende a colapsar todo en 500.
- **Filtra el `error.message` crudo de PostgreSQL** al cliente (nombres de tablas/columnas) → se cruza con el problema de seguridad del ejercicio 09.
- **Valida en el lugar equivocado** (por ejemplo en el repository, o repartido en cada endpoint) en vez de un lugar consistente.

---

## Señales para el oral

- Si metió `zod` y no lo puede justificar → preguntá *"¿por qué una librería y no validar a mano como `validarCursoExiste`?"*.
- Si todo lo inválido devuelve 500 → *"un body vacío, ¿es culpa del cliente o del servidor? ¿qué status corresponde?"*.
- Comparar con `prompt 01` (auditoría) y `prompt 03` (implementación bien hecha).
