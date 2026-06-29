# API REST de Alumnos y Cursos — Express + PostgreSQL

Proyecto educativo de la materia **DAI** (ORT). Una API REST que hace CRUD de alumnos y cursos contra PostgreSQL, construida con una **arquitectura en capas** (controller → service → repository) y una clase helper de acceso a datos (`DbPg`) que aísla todo el boilerplate de PostgreSQL.

*\* **Boilerplate**: código repetitivo y casi siempre idéntico que hay que escribir una y otra vez para que algo funcione (acá: crear el `Pool`, abrir el `try/catch`, loguear el error, extraer `.rows`), pero que no aporta lógica propia de tu aplicación. La idea de un helper como `DbPg` es escribirlo **una sola vez** y reutilizarlo.*

El código es intencionalmente verboso y autoexplicativo, con comentarios pensados para que los estudiantes entiendan cada paso.

> 📖 El repositorio incluye además un **documento de explicación** (en `documents/`) que detalla, paso a paso, cómo funciona esta arquitectura en capas y por qué está diseñada así. Ver la sección [Documentación — Guía de lectura](#-documentación--guía-de-lectura).

---

## 🗂️ Estructura del proyecto

```
src/
├── server.js                   ← Configura Express y monta los controllers
├── controllers/                ← Reciben el request HTTP, llaman al service, responden
│   ├── alumnos-controller.js
│   └── cursos-controller.js
├── services/                   ← Lógica de negocio (calcular edad, validar curso)
│   ├── alumnos-service.js
│   └── cursos-service.js
├── repositories/               ← Acceso a datos (SQL puro a través de DbPg)
│   ├── alumnos-repository.js
│   ├── cursos-repository.js
│   └── db-pg.js                ← Clase helper para PostgreSQL (Pool + try/catch + log)
├── entities/                   ← Clases que representan las tablas
│   ├── alumno.js
│   └── curso.js
├── configs/
│   └── db-config.js            ← Configuración de conexión a PostgreSQL
└── helpers/
    └── log-helper.js           ← Logueo de errores a archivo y/o consola
```

---

## 🚀 Cómo arrancar

### 1. Tener PostgreSQL corriendo

En Windows, el servicio de PostgreSQL tiene que estar iniciado. Si no arranca, abrí **Servicios** (`services.msc`), buscá el servicio de PostgreSQL (por ejemplo `postgresql-x64-18`) y dale **Start**:

![Servicio de PostgreSQL en Windows](documents/images/services-postgress.jpg)

### 2. Crear la base de datos y cargar datos

Abrí **pgAdmin** o cualquier cliente de PostgreSQL y ejecutá el script:

```
documents/database/script-postgress.sql
```

Este archivo crea las tablas `cursos` y `alumnos`, y las llena con datos de ejemplo (135 alumnos repartidos en 5 cursos).

### 3. Configurar la conexión

La configuración de conexión vive en `src/configs/db-config.js`, que **lee las credenciales desde `process.env`** (el archivo `.env`). No hay credenciales escritas en el código.

> 👉 Copiá `.env-template` como `.env` y completá tus datos. Para **cambiar entre PostgreSQL local y Supabase**, editá **una sola línea**: `DB_TARGET`. Ambos juegos de credenciales conviven en el `.env`; `db-config.js` toma el que corresponda (y activa SSL automáticamente para Supabase).

```env
# Cambiá SOLO esta línea: "local" o "supabase"
DB_TARGET = "local"

# PostgreSQL LOCAL
DB_LOCAL_HOST     = "localhost"
DB_LOCAL_DATABASE = "DAI"
DB_LOCAL_USER     = "postgres"
DB_LOCAL_PASSWORD = "root"
DB_LOCAL_PORT     = 5432

# Supabase (nube)
DB_SUPABASE_HOST     = "aws-0-...pooler.supabase.com"
DB_SUPABASE_DATABASE = "postgres"
DB_SUPABASE_USER     = "postgres.xxxx"
DB_SUPABASE_PASSWORD = "TU_CLAVE"
DB_SUPABASE_PORT     = 5432

PORT = 3000
```

### 4. Instalar dependencias y ejecutar

```bash
npm install
npm run server
```

El script `server` usa `node --watch`, así que recarga solo al guardar cambios. La API queda escuchando en `http://localhost:3000`.

### 5. Probar con Postman

Importá la colección de Postman que está en:

```
documents/postman/DAI - PG - Alumnos-cursos.postman_collection.json
```

Tiene requests para todos los endpoints, incluyendo casos de error (404, 400).

---

## 🌐 Endpoints

Tanto `alumnos` como `cursos` siguen el mismo patrón CRUD:

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/alumnos` | Listar todos los alumnos | 200 |
| GET | `/api/alumnos/:id` | Obtener un alumno por ID | 200 / 404 |
| POST | `/api/alumnos` | Crear un alumno (body JSON) | 201 / 400 |
| PUT | `/api/alumnos/:id` | Modificar un alumno | 200 / 404 |
| DELETE | `/api/alumnos/:id` | Eliminar un alumno | 200 / 404 |
| GET | `/api/alumnos/test-insert` | Ejemplo: crear un alumno desde código | 201 |

Lo mismo para `/api/cursos` (sin el `test-insert`).

---

## 🏗️ Arquitectura en capas

![Diagrama de arquitectura en capas](documents/images/arquitectura.jpg)

```
Postman / Browser
       │
       ▼
    server.js                  → Configura Express, monta controllers
       │
  ┌────┴────┐
  ▼         ▼
Controller  Controller         → Recibe req, llama al service, responde con status code
  │         │
  ▼         ▼
Service     Service            → Lógica de negocio (calcular edad, validar que el curso existe)
  │         │
  ▼         ▼
Repository  Repository         → SQL puro, ejecutado a través de DbPg
  │         │
  ▼         ▼
      DbPg                      → Pool de PostgreSQL + try/catch + LogHelper
       │
       ▼
   PostgreSQL
```

**Regla clave**: cada capa solo habla con la de abajo. El controller no sabe de SQL, el repository no sabe de HTTP, y el service no sabe de ninguno de los dos.

### Cómo se ve cada capa

```js
// Controller — solo HTTP
router.get('/:id', async (req, res) => {
    const alumno = await currentService.getByIdAsync(req.params.id);
    res.status(StatusCodes.OK).json(alumno);
});

// Service — lógica de negocio
getByIdAsync = async (id) => {
    const alumno = await this.AlumnosRepository.getByIdAsync(id);
    return agregarEdad(alumno);     // calcula la edad al vuelo
}

// Repository — SQL puro a través de DbPg
getByIdAsync = async (id) => {
    return await this.db.queryOne(`SELECT * FROM alumnos WHERE id=$1`, [id]);
}
```

`AlumnosService` depende de `CursosService` para validar la FK (`id_curso`) antes de insertar o modificar un alumno.

---

## 🧰 La clase `DbPg` — helper de acceso a datos

Los repositories no tocan el `Pool` de `pg` directamente: usan una instancia de `DbPg`, que concentra el boilerplate repetido (crear el Pool, `try/catch`, logueo de errores, extraer `.rows`) en una interfaz de **4 métodos**:

| Método | Devuelve | Uso |
|--------|----------|-----|
| `queryAll(sql, values?)` | array de filas (o `null`) | listados (`SELECT *`) |
| `queryOne(sql, values?)` | una fila (o `null`) | buscar por id |
| `queryReturnId(sql, values?)` | el `id` generado (o `0`) | `INSERT ... RETURNING id` |
| `queryRowCount(sql, values?)` | cantidad de filas afectadas (o `0`) | `UPDATE` / `DELETE` |

Así el repository queda reducido a SQL:

```js
import DbPg from './db-pg.js';

getAllAsync = async () => {
    return await this.db.queryAll(`SELECT * FROM cursos`);
}
```

El `Pool` se crea **una sola vez** (lazy init) y se reutiliza en todas las consultas.

---

## 📦 Carpeta `entities/` — Clases de dominio

Las clases `Alumno` y `Curso` representan las entidades de la base de datos. Sirven para crear objetos desde código (no solo desde `req.body`):

```js
import Alumno from './../entities/alumno.js'

// En vez de depender de lo que manda el cliente...
const nuevoAlumno = new Alumno('Willy', 'Wonka', 1, '2005-07-15', true);
const newId = await currentService.createAsync(nuevoAlumno);
```

Podés ver esto funcionando en el endpoint `GET /api/alumnos/test-insert`.

---

## 📚 Documentación — Guía de lectura

En `documents/` está la explicación completa de **cómo está armado el proyecto y por qué**:

| Documento | Qué explica |
|-----------|-------------|
| [Arquitectura en capas — Controller → Service → Repository → DbPg](documents/server-capas-explicacion.md) | La arquitectura en capas, el flujo de un request, la lógica de negocio en el service (calcular edad, validar FK), la clase helper `DbPg` y sus 4 métodos, y las decisiones de diseño clave (Pool vs Client, queries parametrizadas `$1`, dotenv, entities). |

> 💡 Una vez que entendés la arquitectura, el siguiente paso es **agregarle funcionalidad vos** prompteando con IA de forma incremental: ver la carpeta [`prompting/`](prompting/00%20-%20README%20-%20Como%20usar%20este%20TP%20de%20Prompting.md).

---

## 🗄️ Base de datos

### Tablas

| Tabla | Columnas |
|-------|----------|
| `cursos` | `id` (SERIAL PK), `nombre` |
| `alumnos` | `id` (SERIAL PK), `nombre`, `apellido`, `id_curso` (FK → cursos), `fecha_nacimiento`, `hace_deportes` |

### Scripts

| Archivo | Qué hace |
|---------|----------|
| `documents/database/script-postgress.sql` | Crea las tablas e inserta 5 cursos + 135 alumnos |

---

## 🧪 Postman

La colección para probar la API está en:

```
documents/postman/DAI - PG - Alumnos-cursos.postman_collection.json
```

Incluye requests para todos los endpoints con ejemplos de happy path y casos de error.

---

## 📦 Dependencias

```bash
npm install express            # framework web (Express 5)
npm install cors               # habilitar CORS
npm install pg                 # driver PostgreSQL
npm install dotenv             # variables de entorno desde .env
npm install http-status-codes  # constantes legibles (StatusCodes.OK vs 200)
```

El proyecto usa **ESM** (`"type": "module"`) y `node --watch` para el reinicio automático en desarrollo (no necesita nodemon).
