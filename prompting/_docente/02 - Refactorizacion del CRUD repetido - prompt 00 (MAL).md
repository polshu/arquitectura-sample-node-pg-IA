# Ejercicio 02 — Prompt 00: lo que está MAL ❌

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Ejemplo de un prompt de refactorización mal encarado.

---

## El prompt malo

```
refactorizá todo el CRUD para que no se repita tanto código
```

---

## Por qué está mal

- **Pide ejecución directa, sin diagnóstico.** Salta el paso clave del ejercicio: primero entender la duplicación y elegir una estrategia. Acá deja que la IA decida sola.
- **Sin contexto.** No pega ningún repository → la IA no sabe que existe `DbPg`, que es `pg` sin ORM, ni cómo está el patrón.
- **Sin restricciones.** No dice "no metas un ORM", "no cambies la API pública", "no pierdas la regla de negocio de alumnos".
- **"todo el CRUD"** es vago: ¿repositories? ¿services? ¿controllers? ¿los tres a la vez?

---

## Qué te va a devolver la IA (y por qué es un problema)

Sin diagnóstico ni restricciones, la IA suele tomar el **atajo más drástico**:

- **"Para eliminar todo el SQL repetido, usá Sequelize/Prisma"** → eso **no es refactorizar**, es **reescribir el proyecto** y cambiar el stack. Adiós `pg`, adiós `DbPg`.
- O te arma una **abstracción gigante y mágica** (metaprogramación, métodos generados dinámicamente) que "funciona" pero que el alumno **no puede explicar**.
- O refactoriza las 3 capas de un saque y, al "genericar" el service, **se lleva puesta** la lógica de `alumnos` (calcular edad, validar curso) sin que nadie lo note.

Resultado: menos líneas, sí, pero el alumno no entiende qué quedó, y probablemente **rompió algo**.

---

## Señales para el oral

- Si el alumno fue directo a "refactorizá todo" y aceptó lo primero → 🔴 no diagnosticó, no eligió, no entendió.
- Preguntale: *"¿qué estrategias evaluaste antes de elegir? ¿por qué descartaste el ORM?"* Si no hubo evaluación, comparar con `prompt 01` (diagnóstico) y `prompt 02` (ejecución).
