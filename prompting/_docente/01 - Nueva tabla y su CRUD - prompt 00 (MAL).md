# Ejercicio 01 — Prompt 00: lo que está MAL ❌

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Ejemplo de un prompt mal hecho, para comparar contra lo que trae el alumno.

---

## El prompt malo

```
haceme el crud de materias
```

Eso es todo. Una línea, sin nada más.

---

## Por qué está mal (las 5 partes EFSI que le faltan)

| Parte | ¿Está? | Consecuencia |
|-------|--------|--------------|
| **Rol** | ❌ | La IA no sabe que querés código backend con cierto criterio. |
| **Contexto** | ❌ | No le pegó **ningún** código del proyecto. La IA no tiene idea de cómo está hecho `cursos`, ni que existe `DbPg`, ni que es ESM. |
| **Tarea** | 🟡 a medias | "El CRUD" es ambiguo: ¿las 3 capas? ¿solo la tabla? ¿los endpoints? |
| **Restricciones** | ❌ | No dijo "sin ORM", "usá `pg`", "seguí el estilo de `cursos`". |
| **Iteración** | ❌ | Pide todo de un saque, imposible de revisar capa por capa. |

---

## Qué te va a devolver la IA (y por qué no encaja)

Sin contexto ni restricciones, la IA **inventa un stack**. Lo más probable:

- Te mete un **ORM** (Sequelize, Prisma, TypeORM) → "para el CRUD usá este modelo...". Eso **no es el proyecto**.
- O te arma un repository que abre **su propio `Pool`/`Client`** con `new Pool(config)` y `try/catch` adentro → ignora por completo la clase `DbPg`.
- O te devuelve un `app.get(...)` con `express()` en vez de un `Router` → no se enchufa en `server.js`.
- Nombres y estilo distintos (CommonJS `require`, otra forma de los `console.log`, etc.).

Resultado: el alumno pega eso, no compila o no encaja, y pierde más tiempo arreglándolo que si hubiera prompteado bien.

---

## Señales para el oral

- Si el **primer prompt del alumno** se parece a esto **y lo pegó sin tocar** → 🔴 fuerte señal de "usó IA sin entender".
- Preguntale: *"¿le pasaste algún archivo del proyecto como referencia? ¿qué restricciones le pusiste para que no te metiera un ORM?"* Si no sabe qué responder, no entendió el punto del ejercicio.
- Comparar con `prompt 01`, que es la versión bien hecha del **mismo** pedido.
