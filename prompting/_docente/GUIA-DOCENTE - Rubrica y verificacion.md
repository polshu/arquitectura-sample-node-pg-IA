# 👨‍🏫 Guía Docente — Rúbrica y verificación

> **No entregar a los alumnos.** Documento interno para corregir el TP de Prompting y detectar quién usó IA sin entender.
> Basado en el criterio de *Uso de IA en EFSI*: https://uso-de-ia-en-efsi.lovable.app/#builder

---

## 🎯 Qué estamos evaluando (y qué NO)

**NO** evaluamos si el código funciona (casi siempre va a funcionar — lo hizo una IA). Evaluamos **el proceso de prompteo y la comprensión**:

1. **Calidad del prompt** — ¿usó las 5 partes (Rol / Contexto / Tarea / Restricciones / Iteración)?
2. **Pensamiento crítico** — ¿detectó cuándo la IA se equivocó? ¿descartó sugerencias malas?
3. **Comprensión** — ¿puede explicar el código que entregó, línea por línea?
4. **Proceso e iteración** — ¿iteró o pegó el primer resultado?
5. **Honestidad** — ¿marcó qué hizo la IA vs. qué hizo él/ella?

> 💡 La señal más fuerte de "usó IA sin entender" no está en el código: está en el **oral** y en la **bitácora**. Un alumno que entendió puede defender cada decisión; uno que copió se traba en el "¿por qué?".

---

## 📊 Rúbrica sugerida (por ejercicio)

| Dimensión | 0 — Insuficiente | 1 — Aceptable | 2 — Bueno | 3 — Excelente |
|---|---|---|---|---|
| **Calidad del prompt** | Prompt de una línea, sin contexto | Tarea clara pero sin restricciones ni contexto del proyecto | 3-4 de las 5 partes, pegó código real | Las 5 partes, restricciones precisas, iteración planeada |
| **Pensamiento crítico** | Pegó la salida de la IA tal cual | Detectó 1 problema menor | Detectó y corrigió varios; descartó alguna sugerencia | Encontró un falso positivo / mala práctica que la IA metió y lo justificó |
| **Comprensión (oral)** | No explica qué hace el código | Explica a grandes rasgos | Explica y justifica las decisiones | Explica, justifica y propone alternativas |
| **Proceso / iteración** | Un solo prompt gigante (🟡) | 2 prompts | Iteró con prompts de diagnóstico + ejecución | Iteró, midió/verificó, volvió a iterar |
| **Honestidad / trazabilidad** | Sin marcas `[IA]`/`[YO]`, sin bitácora | Bitácora incompleta | Bitácora completa + marcas en código | Bitácora + marcas + reflexión que se condice con el oral |

**Orientación de nota** (sobre 15): ≥12 muy bueno · 8–11 aprobado · <8 a recuperar (foco en el oral antes de decidir).

---

## 🔍 Verificación técnica por ejercicio (qué chequear vos)

| Ej. | Verificación rápida |
|---|---|
| 01 | El CRUD de la tabla nueva responde los 5 endpoints; el repository delega en `DbPg` (`this.db.queryAll/queryOne/...`, no toca el `Pool`) y usa `$1`; status codes correctos (201 en POST, 404, 400). |
| 02 | Corré los endpoints de `alumnos` y `cursos` **antes y después**: misma respuesta. Bajó la duplicación. No metió ORM. La regla de `edad` sobrevivió. |
| 03 | Helpers en `src/helpers/`, ES modules. Casos de error (404/400) **siguen** devolviendo el mismo status. |
| 04 | `POST` con `{}` → 400 (no 500, no 201 vacío). Mensajes de error no filtran SQL. Validación consistente entre entidades. |
| 05 | `DELETE` sin token → 401. Token vencido → 401. Secreto en `.env`, no hardcodeado. Usa `jwt.verify` (no `decode`). `.env` en `.gitignore`. |
| 06 | El análisis describe el flujo real del código (no genérico). Cada problema existe de verdad. Trade-offs explícitos. Sin sobre-ingeniería. |
| 07 | `npm test` corre. **Rompé `calcularEdad` y mirá si un test se pone rojo** — si no, los tests son tautológicos. Cubre fecha inválida y `null`. No depende del día. |
| 08 | Hay número antes/después. Paginación robusta ante `page=0`, `limit` negativo. Si tocó N+1, bajó la cantidad de queries. |
| 09 | No quedan credenciales en `.js`. Errores no filtran `error.message` de pg. CORS restringido. Clasificó bien la parametrización `$1` como protección, no como vuln. |

---

## 🪤 Preguntas mata-IA para el oral

Tomá 3–5 por alumno, mezclando fáciles y capciosas. Si no puede con las capciosas pero sí explica su código, está OK. Si no puede con ninguna, copió.

### Generales (van para cualquier ejercicio)
1. *Mostrame el prompt que más te costó armar. ¿Por qué ese y no el primero que se te ocurrió?*
2. *Señalá en tu código una línea que escribió la IA y una que cambiaste vos. ¿Por qué la cambiaste?*
3. *¿Con qué sugerencia de la IA NO estuviste de acuerdo?* (Si estuvo de acuerdo con todo → mala señal.)
4. *¿Qué fue lo más difícil de este ejercicio para vos?* (pregunta abierta de cierre)

### Técnicas / capciosas (🪤)
5. 🪤 (Ej. 01) *En `createAsync`, ¿por qué `?? ''` y no `|| ''`? ¿Qué pasa con `hace_deportes = false`?* — `??` solo cae en `null`/`undefined`; `||` también caería con `false`, `0`, `""`. Con `||`, un `false` legítimo se perdería.
6. 🪤 (Ej. 05) *Un JWT, ¿está encriptado?* — **No.** Está firmado y en base64; el payload se lee con cualquiera. No metas datos sensibles.
7. 🪤 (Ej. 05) *¿Qué diferencia hay entre `jwt.verify` y `jwt.decode`?* — `decode` NO valida la firma; permite tokens falsificados. El middleware debe usar `verify`.
8. 🪤 (Ej. 07) *`new Date("cualquier-cosa") instanceof Date` → ¿true o false?* — **true**. Es un `Invalid Date`, sigue siendo `Date`, pero da `NaN`. Por eso hay que chequear `isNaN(fecha.getTime())`.
9. 🪤 (Ej. 09) *¿`WHERE id=$1` con `values=[id]` es vulnerable a SQL injection?* — **No**, pg parametriza. Sí lo sería `WHERE id=${id}` (interpolación de string).
10. 🪤 (Ej. 09) *Moví la contraseña al `.env`, ¿ya está seguro?* — Solo si `.env` está en `.gitignore` **y** la credencial no quedó en el historial de git (si estuvo commiteada, hay que **rotarla**).
11. 🪤 (Ej. 04) *Un body inválido del cliente, ¿es 400 o 500?* — **400** (culpa del cliente). 500 es error del servidor. La IA tiende a poner 500 para todo.
12. 🪤 (Ej. 03) *`res.send(200)` en Express, ¿manda el número 200 como body o setea el status?* — Lo interpreta como **status code**, no como body. Para mandar el número como body, `res.json(200)` o `res.send("200")`.
13. 🪤 (Ej. 08) *Agregar un índice, ¿siempre mejora?* — No: acelera lecturas pero **frena escrituras** y ocupa espacio. Conviene en columnas de `WHERE`/`JOIN`.
14. 🪤 (Ej. 02) *El acceso a datos (`DbPg`) se traga los errores (`catch → return null`). Si la base se cae, ¿qué status recibe el cliente y por qué puede ser engañoso?* — Probablemente 404/500 indistinguible de "no hay datos"; el `null` mezcla "falló" con "vacío".

---

## 📝 Cómo cerrar la corrección

- **Bitácora + oral coherentes** → confiá en la nota de la rúbrica.
- **Bitácora impecable pero oral flojo** → la bitácora también la pudo escribir la IA. Pesá más el oral.
- **Código perfecto + no sabe explicar nada** → 🔴 EFSI: "entregar trabajo de IA sin proceso ni comprensión". A recuperar con foco en comprensión.
- Cerrá siempre con la abierta: *"¿qué fue lo más difícil para vos?"* — los que entendieron tienen una respuesta concreta; los que copiaron, una genérica.
