# 🔑 Respuestas a las "Preguntas para el oral"

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.**
> Respuestas modelo a las preguntas 🤔 que aparecen en cada ejercicio del alumno.
> No son la "única" respuesta: lo que se evalúa es que el alumno **razone** y **muestre su código**, no que recite esto. Abajo de cada respuesta va **qué escuchar** (🟢 bien / 🔴 mal).

---

## Ejercicio 01 — `?? ''` vs `|| ''` y `hace_deportes = false`

**Pregunta:** *en el `createAsync` de `alumnos`, ¿por qué se usa `?? ''` y no `|| ''`? ¿Qué pasaría con un alumno que `hace_deportes = false`?*

**Respuesta:**
- `??` (nullish coalescing) usa el valor por defecto **solo si el valor es `null` o `undefined`** — o sea, "no vino el dato".
- `||` usa el valor por defecto ante **cualquier valor *falsy***: `null`, `undefined`, pero también `0`, `false`, `''` y `NaN`.
- En `alumnos-repository.js` se arma así: `entity?.hace_deportes ?? 0`. Si el alumno **no** hace deportes, manda `hace_deportes = false`, que es un **valor legítimo**, no un "dato faltante".
  - Con `??`: `false ?? 0` → **`false`** ✅ (se guarda bien).
  - Con `||`: `false || 0` → **`0`** ❌ JS trata el `false` como si no hubiera venido y lo pisa con el default.
- Lo mismo pasa con un numérico cuyo valor válido sea `0` (`0 ?? '' → 0`, pero `0 || '' → ''`).

> En criollo: `??` distingue *"no me lo mandaste"* de *"me mandaste un `false`/`0`"*. `||` los confunde.

**Qué escuchar:**
- 🟢 Distingue *falsy* de *null/undefined* y da el caso concreto del `false`.
- 🔴 "Son lo mismo" / "uno es más nuevo". No entendió el bug silencioso.

---

## Ejercicio 02 — herencia: ¿cuántas líneas para una tabla nueva?

**Pregunta:** *si mañana agregás una tabla nueva (por ejemplo `profesores`), ¿cuántas líneas tenés que escribir ahora vs. antes del refactor? Mostrame en tu código qué heredás y qué overrideás.*

**Respuesta:**
- **Antes del refactor:** copiar y pegar el CRUD entero (las 5 operaciones get/getById/create/update/delete) en cada capa → decenas de líneas casi idénticas por entidad.
- **Después:** la clase nueva **hereda** el CRUD genérico de la clase base y solo **overridea** lo específico de la entidad: el **nombre de la tabla**, las **columnas** del INSERT/UPDATE y, si las hay, las **reglas de negocio** propias.
- El alumno tiene que poder **señalar en su propio código**: "esto lo heredo (no lo reescribí)" y "esto lo override porque cambia entre entidades".

> El número exacto depende de su refactor; lo importante es que sea **drásticamente menos** y que sepa explicar *qué* dejó de repetir.

**Qué escuchar:**
- 🟢 Muestra la clase base + la subclase y nombra qué hereda y qué override.
- 🔴 No puede señalar qué reusa; sigue habiendo copy-paste disfrazado.
- ⚠️ Trampa del proyecto: si "no le anda la herencia", suele ser que intentó `super.getAllAsync()` sobre un método escrito como **arrow-field** (no está en el prototipo). Ver `_docente/02 - ... prompt 03`.

---

## Ejercicio 03 — ¿el helper de respuestas debería conocer los status codes?

**Pregunta:** *¿un helper de respuestas debería conocer los status codes, o se los deberías pasar el controller? ¿Por qué? ¿Dónde "vive" la decisión de devolver 404?*

**Respuesta (la distinción clave: *formato* vs. *decisión*):**
- El helper puede y **debe** conocer los status code **estándar**: `responderNotFound` siempre arma un `404`, `responderOk` un `200`. Eso es el **formato** de la respuesta — cómo se ve un 404 — y centralizarlo es justo el objetivo del ejercicio (un solo lugar que sabe "404 = `res.status(404).send(...)`").
- Lo que el helper **NO** decide es **cuándo** corresponde cada uno. Esa **decisión** la toma quien lo llama:
  - El **service** decide la regla de negocio ("este alumno no existe", "esto es un conflicto").
  - El **controller** traduce el resultado del service en la llamada al helper (`if (entity == null) responderNotFound(...)`).
- O sea: **la decisión de devolver 404 vive en el controller/service; el helper solo sabe *cómo se ve* un 404.** El helper es "tonto" a propósito: no conoce reglas de negocio, solo formatea.
- Variante válida y más flexible: un helper genérico `responder(res, status, data)` al que el controller le **pasa** el status. Pierde un poco de legibilidad pero deja toda la decisión afuera. Cualquiera de las dos se defiende; lo que importa es que el alumno ubique **dónde vive la decisión**.

**Qué escuchar:**
- 🟢 Separa "el helper sabe el *formato* del 404" de "el controller/service decide *que* es un 404".
- 🔴 "El helper decide si el alumno existe" → metió lógica de negocio en el helper.

---

## Ejercicio 04 — ¿dónde va la validación? ¿y si la misma regla está en dos endpoints?

**Pregunta:** *¿la validación va en el controller, en el service o en un middleware? Defendé tu elección. ¿Qué pasa si la misma regla la necesitás en dos endpoints distintos?*

**Respuesta:** depende del **tipo** de validación — la clave es que el alumno distinga:
- **Validación de *forma/input*** (¿el body tiene `nombre`? ¿`nota` es un número? ¿el `id` de la URL es numérico?): es barata y no necesita la base. Va bien en un **middleware** o al principio del **controller**. Es "culpa del cliente" → responde **400**.
- **Validación de *negocio*** (¿existe el `id_curso`? ¿ya hay una calificación para ese alumno+materia?): necesita conocer el dominio y consultar la base. Va en el **service** (igual que `validarCursoExiste`), porque ahí vive la regla y se puede **reutilizar**.

**¿Y si la misma regla la necesitás en POST y PUT?** → la ponés en **un solo lugar** (típicamente el **service**, o una función de validación compartida) y la llamás desde los dos endpoints. **No** se copia la regla en cada endpoint del controller: si mañana cambia, querés tocar un solo lugar. Esto es exactamente el espíritu del ejercicio 03 (no repetir) aplicado a las validaciones.

> Regla práctica: *forma* → cerca de la entrada (middleware/controller, 400 rápido); *negocio* → en el service, reutilizable.

**Qué escuchar:**
- 🟢 Distingue validación de forma vs. de negocio y justifica por qué cada una va donde va.
- 🟢 Para POST+PUT: "una sola vez en el service / función compartida", no duplicada.
- 🔴 "La pongo en el controller porque la IA la puso ahí" sin poder defenderlo.
- 🔴 Copia la misma regla en cada endpoint (mismo problema que el ejercicio 03 venía a resolver).

### Ejercicio 04 (bis) — el `id`: `parseInt`, y ¿400 o 404?

**Pregunta:** *antes, ¿por qué el PUT hacía `parseInt` y el GET no? ¿Tu `parsearId` devuelve el número o tira un error? Y un `id` no numérico, ¿es 400 o 404?*

**Respuesta:**
- **¿Por qué el PUT sí y el GET no?** El `PUT` **compara el id en JavaScript** con el del body (`parseInt(entity.id) !== id`); si el id fuera string `"5"` y el del body número `5`, `5 !== "5"` daría `true` (distinto tipo) → falso positivo. Por eso lo convierte. El `GET`/`DELETE` solo le **pasan el id al SQL** (`WHERE id=$1`), y `pg` castea el string al tipo de la columna solo → funcionan sin `parseInt`. La diferencia es real, pero deja el criterio **inconsistente** y **sin validar** que el id sea numérico.
- **¿Devuelve número o tira error?** En la solución de referencia **tira** un error 400 (`errorBadRequest`), para quedar consistente con el patrón `crearError` + `manejarError` del ejercicio. Devolver `null` también es válido, pero obliga a un `if` extra en cada endpoint. Lo importante: que **un solo helper** decida qué es un id válido.
- **¿400 o 404?** Las dos se defienden. La referencia usa **400** ("el id tiene formato inválido": `abc` ni siquiera es un id buscable). **404** sería "no existe ese recurso", que aplica más a un id numérico válido que no está en la base. Lo **inaceptable** es el **500** (que es lo que pasa hoy sin el helper).

**Qué escuchar:**
- 🟢 Explica por qué el PUT comparaba en JS y el GET no, y centraliza la conversión en `parsearId`.
- 🟢 Distingue "id con formato inválido" (400) de "id válido pero inexistente" (404).
- 🔴 Deja el 500, o copia el `parseInt` en cada endpoint sin extraer el helper (movió el problema, no lo resolvió).

---

## Ejercicio 05 — JWT

**Pregunta capciosa:** *un JWT, ¿está encriptado?*
- **No.** Está **firmado** (para detectar manipulación) y **codificado en base64url** (no es cifrado). Cualquiera puede pegar el token en jwt.io y leer el payload. Por eso **no se ponen datos sensibles** adentro (contraseñas, etc.).

**Pregunta para el oral:** *mostrame dónde se valida la firma del token. Si cambio una letra del token, ¿qué pasa y por qué?*
- La firma se valida en el **middleware de auth**, con `jwt.verify(token, secret)` (no `jwt.decode`, que solo lee sin verificar).
- Si cambiás una letra del token, la firma **deja de coincidir** con la que recalcula el server usando el `secret` → `jwt.verify` tira error → el middleware responde **401** y no deja pasar. Esa es la gracia: el payload se puede leer, pero **no se puede modificar** sin invalidar la firma (no tenés el `secret`).

**Qué escuchar:**
- 🟢 "Firmado, no encriptado" + señala `jwt.verify` con el `secret`.
- 🔴 "Sí, está encriptado" / usa `decode` en lugar de `verify`.

---

## Ejercicio 06 — ¿con qué problema de la IA NO estuviste de acuerdo?

**Pregunta:** *de los problemas que encontró la IA, ¿con cuál NO estuviste de acuerdo y por qué?*

No tiene respuesta "correcta" única — es una pregunta de **criterio**. Lo que se evalúa es que el alumno **haya filtrado** lo que dijo la IA, no que lo haya aceptado entero. Ejemplos válidos de desacuerdo razonado:
- "Me dijo que el service de `cursos` 'no hace nada' y que lo borre, pero lo dejé por **consistencia** y para cuando aparezca una regla" (engancha con `_docente/01 - ... prompt 02`).
- "Me propuso meter un patrón/over-engineering que para un proyecto educativo es innecesario."

**Qué escuchar:**
- 🟢 Da un caso concreto y lo justifica. Demuestra lectura crítica.
- 🔴 "Estuve de acuerdo con todo" → no analizó, copió (eso lo dice el propio enunciado).

---

## Ejercicio 07 — testing

**Pregunta:** *rompé `calcularEdad` adelante mío y mostrame qué test se pone rojo. Si ninguno se rompe, ¿para qué sirve el test?*
- Si el test es bueno, al meter un bug en `calcularEdad` (ej. cambiar el `-` por `+`) un test específico **falla (rojo)**. Eso demuestra que el test **cubre** esa lógica.
- Si **ningún** test se rompe, el test no está ejercitando el código de verdad (testea otra cosa, o mockea justo lo que importa, o no tiene asserts útiles) → es un test "de adorno" que da falsa seguridad.

**Qué escuchar:**
- 🟢 Sabe que un test que no falla cuando rompés el código **no sirve**.
- 🔴 Tiene tests verdes pero ninguno cae al romper la función.

---

## Ejercicio 08 — performance

**Pregunta:** *¿cuánto tardaba antes y cuánto ahora? ¿Cómo lo mediste? Si no lo mediste, ¿cómo sabés que mejoró?*
- La respuesta correcta **tiene números y un método de medición**: tiempos de respuesta (Postman, `console.time`, logs), cantidad de queries (ej. detectar y eliminar un N+1), etc.
- El punto pedagógico: **"optimizar" sin medir es fe, no ingeniería.** Si no midió, no puede afirmar que mejoró.

**Qué escuchar:**
- 🟢 Antes/después con números y cómo los obtuvo.
- 🔴 "Lo hice más rápido" sin medición → no lo sabe, lo supone.

---

## Ejercicio 09 — SQL injection

**Pregunta:** *¿por qué `SELECT * FROM alumnos WHERE id=$1` con `values=[id]` NO es vulnerable a SQL injection, pero `SELECT * FROM alumnos WHERE id=${id}` sí lo sería?*
- Con **parámetros** (`$1` + `values=[id]`): el driver `pg` manda la **query y los datos por separado**. El `id` viaja como **dato**, nunca se interpreta como SQL. Si mandás `id = "1; DROP TABLE alumnos"`, eso se busca como un *valor* literal, no se ejecuta.
- Con **interpolación** (`${id}`): el valor se **pega como texto dentro del SQL** antes de mandarlo. Un atacante manda `1 OR 1=1` o `1; DROP TABLE alumnos;` y eso pasa a ser **parte de la sentencia** → se ejecuta.
- La diferencia es **dato vs. código**: los parámetros mantienen la frontera; la interpolación la borra.

**Qué escuchar:**
- 🟢 "Parámetro = dato, interpolación = código ejecutable" y lo muestra en su repo.
- 🔴 "Uso `$1` porque es la convención" sin entender por qué protege.

---

## README (00) — la meta-pregunta

**Pregunta:** *¿Qué fue lo más difícil de este ejercicio para vos, y cómo te diste cuenta de que la respuesta de la IA estaba bien?*

No tiene respuesta de contenido — es para que el alumno demuestre **proceso y pensamiento crítico**: qué iteró, qué corrigió de la IA, cómo **verificó** (probó en Postman, comparó con el código original, etc.). 🔴 Señal mala: "no tuve que corregir nada, salió a la primera" → o no analizó, o no probó.
