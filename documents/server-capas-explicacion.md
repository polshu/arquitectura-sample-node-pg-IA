# Arquitectura en capas — Controller → Service → Repository → DbPg

> **Archivos**: `src/server.js` + `src/controllers/` + `src/services/` + `src/repositories/`
> **Cómo ejecutarlo**: `npm run server`

Este documento explica **cómo está organizado el proyecto y por qué**. La API hace un CRUD de `alumnos` y `cursos` contra PostgreSQL, pero en vez de meter todo en un archivo, separa el código en **capas**, cada una con una única responsabilidad: manejar el request HTTP, aplicar las reglas de negocio, y hacer las queries a la base de datos.

Más abajo, además de las capas, se explica la clase `DbPg`, que concentra el *boilerplate* de PostgreSQL para que los repositories queden reducidos a SQL.

---

## 🧩 ¿Qué son las capas y para qué sirven?

Imaginá un local de comidas rápidas (tipo McDonald's). Fijate que **no hay una sola persona haciendo todo**: hay un cajero, una cocina con varios especialistas, y un depósito con un encargado por rubro. Cada uno tiene **una sola responsabilidad** y solo habla con quien tiene al lado:

```
CLIENTE (Postman / navegador)
    │  "Quiero un Combo Big Mac"
    ▼
🧾 CAJERO (Controller)              → Toma el pedido, da el ticket, entrega la bandeja. NO cocina.
    │
    ▼
👨‍🍳 COCINA (Services)               → Equipo de ESPECIALISTAS que arman el pedido con sus recetas y reglas
    │   ├─ Especialista en hamburguesas        (AlumnosService)
    │   ├─ Especialista en papas
    │   └─ Especialista en bebidas             (CursosService)
    │        ↑ cuando un pedido cruza especialidades, se piden cosas ENTRE ELLOS
    ▼
📦 DEPÓSITO (Repositories)          → Un ENCARGADO por rubro: sabe de qué estante sacar SU ingrediente
    │   ├─ Encargado del depósito de carne y pan   (AlumnosRepository)
    │   └─ Encargado del depósito de bebidas        (CursosRepository)
    │
    ▼
🛒 ESTANTERÍAS + MONTACARGAS (DbPg) → La maquinaria común que todos los encargados usan para entrar al depósito
    ▼
🏭 PROVEEDOR (PostgreSQL)
```

- El **cajero** no cocina — solo recibe el pedido del cliente, se lo pasa a la cocina, y cuando está lista la bandeja la entrega con el ticket. No sabe de recetas ni de ingredientes.
- La **cocina** no atiende al público ni va al depósito a buscar cosas. **No es una sola persona: es un equipo de especialistas**, cada uno experto en su producto, que sigue las recetas y aplica las reglas. "Un Big Mac es: dos medallones, salsa especial, lechuga, queso, pepinos, cebolla, pan con sésamo". Si no hay pan integral, no se puede armar el combo Veggie. Si el pedido es un combo, el especialista en hamburguesas le **pide** al de papas y al de bebidas que aporten su parte — no lo hace él. Y para los ingredientes, cada especialista le **pide** a su encargado de depósito.
- El **depósito** también está dividido: hay **un encargado por rubro** (carne, bebidas...). Cada encargado conoce exactamente dónde está **su** ingrediente, cómo sacarlo y cómo guardarlo. No sabe de recetas ni de clientes — solo busca y entrega lo que le piden. Y ninguno se fabrica su propio montacargas: todos usan **la misma maquinaria compartida** para entrar al depósito.

Si mañana cambiás de proveedor de ingredientes (de PostgreSQL a Supabase, por ejemplo), solo cambiás lo que hay detrás del depósito. La cocina y el cajero ni se enteran.

> 💡 **¿Por qué McDonald's y no un restaurante?** Porque en el fast food **todo está estandarizado**: pedidos fijos, recetas predecibles, ingredientes uniformes. Eso se parece más a una API: requests estandarizados, lógica predecible, datos uniformes.

> 🧠 **Quedate con esto** (lo desarrollamos abajo): el **cajero** (controller) solo recibe y entrega; las **recetas y reglas** viven en los **especialistas de la cocina** (services); los **especialistas se piden cosas entre sí** (service → service); y cada **encargado de depósito** (repository) saca su ingrediente usando el **montacargas compartido** (`DbPg`).

---

## 📁 Estructura de archivos

```
src/
├── server.js                      ← Arranque: configura Express y conecta los controllers
├── controllers/
│   ├── alumnos-controller.js      ← Cajero: recibe HTTP requests, responde con status codes
│   └── cursos-controller.js
├── services/
│   ├── alumnos-service.js         ← Cocina: especialista en su entidad (reglas, validaciones, cálculos)
│   └── cursos-service.js
├── repositories/
│   ├── alumnos-repository.js      ← Encargado del depósito (por rubro): SQL contra PostgreSQL
│   ├── cursos-repository.js
│   └── db-pg.js                   ← Montacargas compartido: Pool + try/catch + LogHelper
├── entities/
│   ├── alumno.js                  ← Clases de dominio (Alumno, Curso)
│   └── curso.js
├── configs/
│   └── db-config.js               ← Configuración de conexión a la base de datos
└── helpers/
    └── log-helper.js              ← Utilidad para loguear errores (archivo + consola)
```

---

## 🔄 ¿Cómo fluye un request?

Supongamos que llega un `GET /api/alumnos/5`:

```
Postman
  │  GET /api/alumnos/5
  ▼
server.js                  →  app.use("/api/alumnos", AlumnosController)
  │
  ▼
alumnos-controller.js      →  router.get('/:id', ...)
  │                             Extrae id = 5 del req.params
  │                             Llama a currentService.getByIdAsync(5)
  ▼
alumnos-service.js         →  getByIdAsync(5)
  │                             Llama al repository para buscar el alumno
  │                             Le calcula la edad a partir de fecha_nacimiento
  │                             Devuelve el alumno con el campo "edad" agregado
  ▼
alumnos-repository.js      →  getByIdAsync(5)
  │                             Ejecuta: SELECT * FROM alumnos WHERE id=$1 (a través de DbPg)
  │                             Devuelve el row o null
  ▼
db-pg.js (DbPg)            →  Toma una conexión del Pool, corre la query, devuelve .rows[0]
  ▼
PostgreSQL
```

Fijate que **cada capa solo habla con la de abajo**. El controller no sabe de SQL, el repository no sabe de HTTP, y el service no sabe de ninguno de los dos.

---

## 📂 ¿Qué hace cada carpeta?

| Carpeta | Qué contiene | ¿Por qué existe? |
|---------|-------------|-------------------|
| `controllers/` | Routers de Express que reciben requests y responden con status codes | Separar la lógica HTTP del resto — si cambiás de Express a Fastify, solo tocás acá |
| `services/` | Clases con lógica de negocio: validaciones, cálculos, reglas | Centralizar las reglas para que no se repitan en cada endpoint |
| `repositories/` | Clases que ejecutan SQL a través de `DbPg` | Aislar el acceso a datos — si cambiás de PostgreSQL a SQL Server, solo tocás acá |
| `entities/` | Clases que representan las tablas (`Alumno`, `Curso`) | Crear objetos con estructura definida desde código, no depender siempre de `req.body` |
| `configs/` | Configuración de conexión a la base de datos | Centralizar en un lugar las credenciales y parámetros |
| `helpers/` | Utilidades transversales (LogHelper) | Funcionalidad compartida que no pertenece a ninguna capa específica |

> 💡 **Cada carpeta tiene una sola razón de existir.** Si mañana cambiás algo, sabés exactamente dónde buscarlo. Esa es la idea: que el código se encuentre donde lo esperás.

---

## 📋 ¿Qué hace cada capa? (en detalle)

### Controller — el cajero

El controller es un `Router` de Express. Su trabajo es:
1. **Leer** los datos del request (`req.params`, `req.body`)
2. **Llamar** al service correspondiente
3. **Responder** con el status code y el JSON adecuado
4. **Catchear** errores y devolver un status de error

```js
// alumnos-controller.js
router.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;                                     // 1. Leo
        const returnEntity = await currentService.getByIdAsync(id); // 2. Llamo
        if (returnEntity != null){
            res.status(StatusCodes.OK).json(returnEntity);          // 3. Respondo 200
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontro...`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`); // 4. Catcheo
    }
});
```

> 💡 **El controller es el único que conoce `req`, `res`, y los status codes HTTP.** Ninguna otra capa debería importar Express ni devolver status codes.

#### El PUT — ID en la URL y validación contra el body

En REST, la URL identifica **qué recurso** estás modificando. Por eso `GET /:id`, `PUT /:id` y `DELETE /:id` llevan el ID en la URL. En el `PUT`, además, validamos que el ID de la URL coincida con el del body si el body lo trae:

```js
router.put('/:id', async (req, res) => {
    let id = parseInt(req.params.id);   // ID de la URL (fuente de verdad)
    let entity = req.body;

    if (entity.id && parseInt(entity.id) !== id) {
        return res.status(StatusCodes.BAD_REQUEST)
            .send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }
    entity.id = id;   // usamos el id de la URL, no el del body
    // ...
});
```

> 💡 **La regla**: el ID de la URL es la **fuente de verdad**. Si el body manda `PUT /api/alumnos/5` con `{ "id": 99 }`, ¿modificás el 5 o el 99? Devolvemos un **400** claro en vez de un bug silencioso.

> 🔎 **Ojo a una inconsistencia a propósito**: acá el `PUT` hace `let id = parseInt(req.params.id)`, pero el `GET /:id` y el `DELETE /:id` usan `req.params.id` tal cual (string). El PUT necesita el número porque **compara el id en JavaScript** con el del body; el GET/DELETE solo se lo pasan a `pg` (que castea solo). Funciona, pero el criterio quedó disparejo y nadie valida que el `id` sea realmente numérico. **Eso se unifica en [`prompting/04 - Validaciones...`](../prompting/04%20-%20Validaciones%20y%20codigos%20de%20error.md)** extrayendo un helper que valida y convierte el `id` en un solo lugar.

---

### Service — la cocina

El service es una **clase** que contiene la lógica de negocio: las reglas, validaciones, cálculos y transformaciones que no son ni "leer el request" ni "hacer una query". **Acá es donde viven las recetas y las reglas.**

En la analogía, **la cocina no es una sola persona: es un equipo de especialistas**, cada uno experto en su producto:

- El **especialista en hamburguesas** sabe la receta del Big Mac y sus reglas ("si no hay pan integral, no se puede armar el combo Veggie").
- El **especialista en papas** sabe los tiempos de fritura.
- El **especialista en bebidas** sabe la medida de cada vaso.

Cada especialista es **un service**. En este proyecto: `AlumnosService` (especialista en alumnos) y `CursosService` (especialista en cursos). La "receta" y las "reglas" del especialista son, en el código, las **validaciones y los cálculos** (lo vemos enseguida con `calcularEdad` y `validarCursoExiste`).

#### Un especialista le pide a otro: service → service

Cuando llega un **Combo Big Mac**, el especialista en hamburguesas arma el Big Mac, pero el combo también lleva papas y bebida. En vez de hacerlo él (no es su especialidad, y no quiere meter mano donde no sabe), **le pide al especialista en papas y al de bebidas** que aporten su parte. Eso es **un service llamando a otro service**.

En el código pasa lo mismo: para crear un alumno, `AlumnosService` necesita confirmar que el curso existe. En vez de meter mano en el depósito de cursos, **le pregunta al `CursosService`** (el especialista en cursos):

```
Combo Big Mac (pedido)                     POST /api/alumnos (crear un alumno)
 └ Especialista en hamburguesas      =      AlumnosService
     ├ le pide al esp. de bebidas    =       ├ le pregunta a CursosService: "¿existe el curso?"
     └ le pide al depósito de carne   =       └ le pide a AlumnosRepository: "guardá el alumno"
```

> 💡 **La regla de oro**: un especialista **nunca** entra al depósito de otro rubro. Si el de hamburguesas necesita una bebida, se la pide al especialista en bebidas — no va él al depósito de gaseosas. Por eso en el código `AlumnosService` usa `CursosService` (otro especialista) y **no** `CursosRepository` (el depósito de cursos) directamente: así **respeta las capas y las especialidades**.

En este proyecto, `AlumnosService` hace dos cosas concretas que el repository no hace:

#### 1. Calcular la edad del alumno

La base guarda `fecha_nacimiento`, pero la **edad** cambia con el tiempo — no tiene sentido guardarla. El service la calcula al vuelo:

```js
// alumnos-service.js
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

getAllAsync = async () => {
    const returnArray = await this.AlumnosRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray.map(alumno => agregarEdad(alumno));   // ← agrega "edad" a cada alumno
}
```

> 🤔 **¿Por qué no calcular la edad en la base de datos?** Podrías hacer `EXTRACT(YEAR FROM AGE(fecha_nacimiento))` en SQL, pero eso mezcla lógica de negocio con la query. Si mañana la regla cambia (por ejemplo, "la edad se calcula al 1 de marzo"), preferís cambiar una función en JavaScript y no tocar el SQL.

#### 2. Validar que el curso existe antes de crear/actualizar un alumno

Si alguien manda un POST con `id_curso: 999` y ese curso no existe, sin validación PostgreSQL tira un error críptico de foreign key. Con validación en el service, devolvemos un mensaje claro:

```js
// alumnos-service.js
createAsync = async (entity) => {
    await this.validarCursoExiste(entity.id_curso);         // ← valida antes de insertar
    const rowsAffected = await this.AlumnosRepository.createAsync(entity);
    return rowsAffected;
}

validarCursoExiste = async (idCurso) => {
    if (!idCurso) return;
    const curso = await this.CursosService.getByIdAsync(idCurso);
    if (curso == null) {
        throw new Error(`El curso con id ${idCurso} no existe.`);
    }
}
```

Fijate algo clave: **`AlumnosService` usa `CursosService`** para verificar si el curso existe. No va directo al repository de cursos — respeta las capas. Esto es un **service llamando a otro service**: el mismo "especialista en hamburguesas le pide al de bebidas" del combo, ahora en código.

```
AlumnosController
    └── AlumnosService
            ├── AlumnosRepository    (para guardar el alumno)
            └── CursosService        (para verificar que el curso existe)
                    └── CursosRepository
```

#### ¿Qué pasaría si NO tuviéramos un service?

Imaginemos que todo se hace en el controller:

- **"Calculá la edad"**: ponés `calcularEdad()` en el controller. Funciona. Pero mañana necesitás la edad en un reporte PDF de otro módulo → copiás la función. Ahora la misma lógica está en dos lugares.
- **"No dejes crear un alumno en un curso que no existe"**: ponés la validación en el POST. Pero el PUT también la necesita. Y un endpoint de importar CSV también → se copia y se copia.

Con service, la lógica vive en **un solo lugar** y cualquier endpoint que cree o modifique un alumno pasa por ahí.

> 💡 **Regla práctica**: si una regla de negocio se necesita en más de un endpoint, va en el service. Si la dejás en el controller, la vas a terminar copiando.

---

### Repository — el encargado del depósito (uno por rubro)

Así como la cocina tiene un especialista por producto, **el depósito tiene un encargado por rubro**: uno maneja el depósito de carne y pan, otro el de bebidas. Cada **encargado de depósito es un repository**: sabe exactamente de qué estante sacar **su** ingrediente y cómo guardarlo, pero no conoce recetas ni clientes. En el código: `AlumnosRepository` (depósito de alumnos) y `CursosRepository` (depósito de cursos).

El repository es una **clase** que ejecuta las queries SQL. Es el único que conoce las tablas. Pero ojo con un detalle: **el encargado no se fabrica su propio montacargas**. Para entrar físicamente al depósito —sacar el ítem del estante y, si algo está roto, anotarlo— todos los encargados usan **la misma maquinaria compartida: la clase `DbPg`** (`this.db`). Por eso el repository **no toca el `Pool` de `pg` directamente**:

```js
// alumnos-repository.js
import Db from './db-pg.js';

export default class AlumnosRepository {
    constructor() {
        this.db = new Db();
    }

    getAllAsync = async () => {
        const sql = `SELECT * FROM alumnos`;
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        const sql = `SELECT * FROM alumnos WHERE id=$1`;
        return await this.db.queryOne(sql, [id]);
    }
}
```

El repository queda reducido a **qué estante (SQL) + qué valores + pedirle a la maquinaria (`DbPg`) que lo traiga**. El `try/catch`, el `Pool` y el logueo viven en `DbPg` (ver la sección siguiente) — el montacargas es **uno solo para todos los rubros**.

---

## 🧰 La clase `DbPg` — el montacargas compartido del depósito

> 🛒 En la analogía, `DbPg` es la **maquinaria que todos los encargados de depósito comparten** para entrar, sacar el ítem del estante y avisar si algo está roto. Ningún encargado (repository) se fabrica la suya: todos usan la misma.

### ¿Cuál es el problema?

Antes de tener `DbPg`, cada repository repetía el mismo *boilerplate*. Mirá cómo se vería `getAllAsync` sin el helper:

```js
getAllAsync = async () => {
    let returnArray = null;
    try {
        const sql = `SELECT * FROM alumnos`;
        const resultPg = await this.getDBPool().query(sql);
        returnArray = resultPg.rows;
    } catch (error) {
        LogHelper.logError(error);
    }
    return returnArray;
}
```

Lo único que cambia entre `alumnos` y `cursos` es **el SQL**. Todo lo demás — el `try/catch`, el `LogHelper.logError`, el manejo del `Pool`, el `.rows` — es boilerplate que se repetiría textualmente. Con 10 entidades (profesores, materias, horarios...), tendrías 10 repositories con el mismo boilerplate copiado.

### La solución: una clase `DbPg`

La idea es **extraer todo lo que se repite** a una clase aparte que se encargue de:

- Crear y administrar el Pool (una sola vez, *lazy*).
- Ejecutar queries con `try/catch`.
- Loguear errores con `LogHelper`.
- Extraer los datos del resultado de `pg` (`.rows`, `.rows[0]`, `.rowCount`).

```
SIN DbPg                                 CON DbPg
┌─────────────────────────┐              ┌─────────────────────────┐
│  AlumnosRepository      │              │  AlumnosRepository      │
│  ├─ import pg + Pool    │              │  ├─ import Db           │
│  ├─ import config       │              │  └─ métodos con SQL     │
│  ├─ import LogHelper    │              │     (sin try/catch,     │
│  ├─ getDBPool()         │              │      sin Pool,          │
│  └─ métodos con:        │              │      sin LogHelper)     │
│     ├─ try/catch        │              └─────────┬───────────────┘
│     ├─ getDBPool()      │                        │ usa
│     ├─ LogHelper        │              ┌─────────▼───────────────┐
│     └─ resultPg.rows    │              │  DbPg                   │
└─────────────────────────┘              │  ├─ Pool (lazy)         │
                                         │  ├─ try/catch           │
(y lo mismo en cada                      │  ├─ LogHelper           │
 repository...)                          │  └─ queryAll/queryOne/  │
                                         │     queryReturnId/      │
                                         │     queryRowCount       │
                                         └─────────────────────────┘
```

### Los 4 métodos de `DbPg`

Cada método encapsula un **patrón de uso distinto** que aparece en los repositories:

| Método | ¿Qué devuelve? | ¿Cuándo se usa? | Ejemplo |
|--------|----------------|-----------------|---------|
| `queryAll(sql, values?)` | `rows` (array) o `null` | SELECT que devuelve una lista | `SELECT * FROM cursos` |
| `queryOne(sql, values?)` | `rows[0]` (objeto) o `null` | SELECT que devuelve un registro | `SELECT * FROM cursos WHERE id=$1` |
| `queryReturnId(sql, values?)` | `rows[0].id` (número) o `0` | INSERT con `RETURNING id` | `INSERT INTO cursos (...) RETURNING id` |
| `queryRowCount(sql, values?)` | `rowCount` (número) o `0` | UPDATE / DELETE | `DELETE FROM cursos WHERE id=$1` |

Los cuatro hacen lo mismo internamente:
1. Obtienen el Pool (lazy).
2. Ejecutan la query con `try/catch`.
3. Si falla, loguean el error con `LogHelper`.
4. Extraen el dato relevante del resultado de `pg`.

```js
// db-pg.js
queryOne = async (sql, values = null) => {
    let returnEntity = null;
    try {
        const resultPg = values
            ? await this.getDBPool().query(sql, values)
            : await this.getDBPool().query(sql);
        if (resultPg.rows.length > 0) {
            returnEntity = resultPg.rows[0];
        }
    } catch (error) {
        LogHelper.logError(error);
    }
    return returnEntity;
}
```

### Programar contra una interfaz

El repository hace `this.db = new Db()` y después `this.db.queryAll(...)`, `this.db.queryOne(...)`, etc. No sabe (ni le importa) si por dentro hay un Pool de `pg`. Solo sabe que tiene un objeto `db` con 4 métodos.

> 💡 Esto se llama **"programar contra una interfaz"**. Si mañana quisieras usar otro motor (SQL Server, Supabase), bastaría con escribir otra clase con esos mismos 4 métodos y cambiar el `import Db from './db-pg.js'` por el del nuevo motor — el resto del repository quedaría intacto. (Ojo: las queries deberían adaptar los placeholders, porque cada motor tiene su sintaxis: `$1` en PostgreSQL, `@param1` en SQL Server.)

> 🧠 **¿Por qué no se hizo así desde el principio?** Porque primero hay que **ver el problema**. Si arrancás con `DbPg` sin haber sentido el dolor del boilerplate repetido, no entendés qué resuelve. La regla clásica es la **"regla de tres"**: si copiaste algo dos veces (tres copias en total), es hora de extraerlo. Primero hacelo funcionar, después refactorizá cuando el patrón se repite.

---

## 🔧 Otras decisiones de diseño que conviene conocer

### Pool en vez de Client (performance)

`DbPg` usa un **Pool** de conexiones, no un `Client` nuevo por request. Conectarse a PostgreSQL es costoso (abrir socket TCP, handshake de autenticación, proceso nuevo en el servidor: ~20-100 ms). Un `Client` por request crearía y destruiría una conexión cada vez, y bajo carga agotaría el límite de conexiones de PostgreSQL.

```
CON CLIENT (lento):
Request 1 → [crear conexión] → query → [cerrar conexión]
Request 2 → [crear conexión] → query → [cerrar conexión]

CON POOL (rápido):
Arranque  → [crear N conexiones]
Request 1 → [tomar del pool] → query → [devolver al pool]
Request 2 → [tomar del pool] → query → [devolver al pool]
```

> 💡 **Regla simple**: si tu programa se queda corriendo (un servidor Express), usá **Pool**. Si corre una vez y termina (un script de migración), un **Client** alcanza. Además, con Pool no hace falta `finally` con `client.end()` — el pool administra las conexiones solo.

### Queries parametrizadas (`$1, $2`) — protección contra SQL injection

Todas las queries usan **parámetros posicionales** (`$1`, `$2`, ...) con un array de `values`, nunca concatenación de strings:

```js
// ✅ Seguro — pg escapa el valor
const sql = `SELECT * FROM alumnos WHERE id=$1`;
return await this.db.queryOne(sql, [id]);

// ❌ Vulnerable — NUNCA hagas esto
const sql = `SELECT * FROM alumnos WHERE id=${id}`;
```

Si un usuario manda `'; DROP TABLE alumnos; --` como valor, con `$1` la query no se rompe porque `pg` lo trata como **dato**, no como SQL. Con interpolación de string, sería una inyección grave.

### Variables de entorno con dotenv

`server.js` importa `dotenv/config` al arrancar, y `db-config.js` lee las credenciales de `process.env` (archivo `.env`) — no están escritas en el código. Además, con una sola variable `DB_TARGET` se elige a qué base conectarse (`"local"` o `"supabase"`), tomando el juego de variables que corresponda:

```js
// db-config.js
const target = (process.env.DB_TARGET ?? 'local').trim().toLowerCase();
const prefix = target === 'supabase' ? 'DB_SUPABASE_' : 'DB_LOCAL_';

const DBConfig = {
    host     : process.env[prefix + 'HOST']     ?? 'localhost',
    database : process.env[prefix + 'DATABASE'] ?? '',
    user     : process.env[prefix + 'USER']     ?? '',
    password : process.env[prefix + 'PASSWORD'] ?? '',
    port     : process.env[prefix + 'PORT']     ?? 5432,
    ssl      : target === 'supabase' ? { rejectUnauthorized: false } : false
}
```

Así, cambiar de PostgreSQL local a Supabase es editar **una sola línea** del `.env`. El puerto del servidor también es configurable: `const port = process.env.PORT || 3000;`.

> ⚠️ **Cuidado con el `.env`**: que las credenciales salgan del código es solo media solución — el `.env` **no debe commitearse** (tiene que estar en `.gitignore`). Y si una credencial estuvo alguna vez en un commit, además de sacarla hay que **rotarla** (sigue en el historial de git). Esto se trabaja en `prompting/09 - Seguridad.md`.

### Errores silenciados (simplificación didáctica)

Si una query falla, `DbPg` loguea el error con `LogHelper` y devuelve `null` o `0`. El controller interpreta eso como "no se encontró" o "error interno". Es una simplificación para el curso: en un proyecto real dejarías que el error suba para poder distinguir **"no encontrado"** de **"la base se cayó"** — con el `return null` actual, esos dos casos se confunden.

---

## 📦 Carpeta `entities/` — crear objetos desde código

En el POST normal, los datos del alumno vienen del body del request (`req.body`), un objeto genérico sin estructura definida. ¿Y si querés crear un alumno **desde código** (un test, un script, un endpoint de demostración)? Para eso está la clase `Alumno`:

```js
import Alumno from './../entities/alumno.js'

// Crear un alumno con campos definidos — sabés exactamente qué lleva
const nuevoAlumno = new Alumno('Willy', 'Wonka', 1, '2005-07-15', true);
const newId = await currentService.createAsync(nuevoAlumno);
```

Podés ver esto funcionando en el endpoint `GET /api/alumnos/test-insert`.

> 💡 **La clase `Alumno` y `req.body` producen lo mismo**: un objeto con `nombre`, `apellido`, `id_curso`, `fecha_nacimiento` y `hace_deportes`. La diferencia es que con la clase tenés **estructura y claridad** — sabés qué campos lleva, el IDE te autocompleta, y si mañana querés agregar validación en el constructor, lo hacés en un solo lugar.

---

## 🔁 La gran ventaja: cada capa se puede intercambiar

```
                    HOY                                 MAÑANA
Controller ──► Service ──► Repository (pg)     Controller ──► Service ──► Repository (otro motor)
                                                    ↑ igual        ↑ igual        ↑ cambia solo esto
```

- **¿Cambiar de base de datos?** Solo tocás los repositories / la clase `Db`. El controller y el service ni se enteran.
- **¿Cambiar de framework web?** Solo tocás los controllers. Los services y repositories no importan Express — no saben que existe.
- **¿Agregar una app móvil o un job nocturno?** Pueden usar el mismo service (con `calcularEdad`, `validarCursoExiste`) sin pasar por Express.

> 🤔 **Pensalo así**: las capas son como enchufes. Mientras la interfaz (los métodos `getAllAsync`, `getByIdAsync`, `createAsync`...) sea la misma, podés cambiar lo que hay atrás sin romper lo de adelante.

---

## 🔗 ¿Qué sigue?

Ahora que entendés cómo está armado el proyecto, el siguiente paso es **agregarle funcionalidad vos mismo**, prompteando con IA de forma incremental. Todo eso está en la carpeta **[`prompting/`](../prompting/00%20-%20README%20-%20Como%20usar%20este%20TP%20de%20Prompting.md)**: agregar una tabla nueva con su CRUD, refactorizar la duplicación, extraer helpers, validar input, sumar autenticación JWT, y más.
