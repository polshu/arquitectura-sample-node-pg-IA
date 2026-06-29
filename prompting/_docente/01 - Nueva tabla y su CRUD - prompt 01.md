# Ejercicio 01 — Prompt 01: el repository (bien hecho) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Primer prompt de la secuencia modelo. Acá empieza a hacerse bien lo que el `prompt 00` hizo mal.

---

## El prompt

```
Actuá como un desarrollador backend senior en Node.js y Express.

Contexto: tengo una API REST en Express 5 con ES modules y arquitectura en capas
(controller → service → repository). El acceso a datos NO usa un ORM: cada repository
delega en una clase helper `DbPg` (this.db) que expone queryAll, queryOne,
queryReturnId y queryRowCount, con queries parametrizadas ($1, $2). Te pego como
referencia de estilo dos archivos:

--- cursos-repository.js ---
[PEGÁS EL ARCHIVO cursos-repository.js]

--- db-pg.js ---
[PEGÁS EL ARCHIVO db-pg.js]

Tarea: generá SOLO el `materias-repository.js` para una tabla `materias (id, nombre)`,
copiando exactamente el mismo patrón que `cursos-repository.js`: clase con
this.db = new Db(), y los métodos getAllAsync, getByIdAsync, createAsync, updateAsync
y deleteByIdAsync usando this.db.queryAll/queryOne/queryReturnId/queryRowCount.

Restricciones: no agregues dependencias nuevas, no uses ORM, no abras un Pool propio
(usá DbPg), mantené los console.log de debug, y usá ?? igual que en cursos.

No hagas todavía el service ni el controller: te los pido después.
```

## Las 5 partes EFSI presentes

- **Rol**: desarrollador backend senior.
- **Contexto**: stack + arquitectura + **pega `cursos-repository.js` y `db-pg.js`**.
- **Tarea**: solo el repository de `materias`.
- **Restricciones**: sin ORM, sin Pool propio, sin dependencias, mismo estilo.
- **Iteración**: "no hagas el service ni el controller todavía".

---

## Qué debería devolver la IA (respuesta modelo)

```js
import Db from './db-pg.js';

export default class MateriasRepository {
    constructor() {
        console.log('Estoy en: MateriasRepository.constructor()');
        this.db = new Db();
    }

    getAllAsync = async () => {
        const sql = `SELECT * FROM materias`;
        return await this.db.queryAll(sql);
    }

    getByIdAsync = async (id) => {
        const sql = `SELECT * FROM materias WHERE id=$1`;
        return await this.db.queryOne(sql, [id]);
    }

    createAsync = async (entity) => {
        const sql = `INSERT INTO materias (nombre) VALUES ($1) RETURNING id`;
        return await this.db.queryReturnId(sql, [entity?.nombre ?? '']);
    }

    updateAsync = async (entity) => {
        const sql = `UPDATE materias SET nombre = $2 WHERE id = $1`;
        return await this.db.queryRowCount(sql, [entity.id, entity?.nombre ?? '']);
    }

    deleteByIdAsync = async (id) => {
        const sql = `DELETE FROM materias WHERE id=$1`;
        return await this.db.queryRowCount(sql, [id]);
    }
}
```

## Para comparar con el alumno

- ✅ ¿Pegó **código de referencia** (cursos + db-pg) en su prompt? Es la diferencia clave con el `prompt 00`.
- ✅ ¿Pidió **solo el repository** o las 3 capas juntas? Lo bueno es de a una.
- ✅ ¿El resultado usa `this.db.*` y `$1` (no `new Pool`, no concatenación)?
