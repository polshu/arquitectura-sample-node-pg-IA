# Ejercicio 02 — Prompt 02: ejecución (implementar la estrategia elegida) ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Segundo paso: ya elegida la estrategia A (BaseRepository), pedir la implementación con restricciones fuertes.

---

## El prompt

```
Elegí la estrategia A (BaseRepository por herencia). Implementala.

Creá una clase `BaseRepository` que reciba el nombre de tabla en el constructor y
tenga this.db = new Db() y los métodos COMUNES: getAllAsync, getByIdAsync y
deleteByIdAsync (que solo dependen de la tabla y el id). Después, que
`AlumnosRepository` y `CursosRepository` extiendan de BaseRepository, pasen su nombre
de tabla con super(), y SOLO definan los métodos específicos (createAsync y
updateAsync, que tienen columnas propias).

Restricciones MUY importantes:
- La API pública NO cambia: los mismos métodos, los endpoints responden igual.
- No toques los services ni los controllers. Esto es SOLO refactor de repositories.
- Seguí usando DbPg (this.db) y queries con $1 para los valores. El nombre de tabla
  se interpola en el SQL porque es una constante que defino yo (no input de usuario).
- No agregues dependencias ni un ORM.
```

## Por qué este prompt

- Viene **después de elegir** (prompt 01) → no improvisa.
- Las **restricciones son el corazón**: "API no cambia", "no toques services/controllers", "DbPg + $1", "sin ORM". Sin esto, la IA sobre-refactoriza.
- Acota el alcance (solo repositories) para que sea revisable.

---

## Qué debería devolver la IA (respuesta modelo)

```js
// base-repository.js
import Db from './db-pg.js';

export default class BaseRepository {
    constructor(tableName) {
        this.db = new Db();
        this.tableName = tableName;   // constante del dev → seguro interpolarla
    }

    getAllAsync = async () => {
        return await this.db.queryAll(`SELECT * FROM ${this.tableName}`);
    }
    getByIdAsync = async (id) => {
        return await this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE id=$1`, [id]);
    }
    deleteByIdAsync = async (id) => {
        return await this.db.queryRowCount(`DELETE FROM ${this.tableName} WHERE id=$1`, [id]);
    }
}
```

```js
// cursos-repository.js
import BaseRepository from './base-repository.js';

export default class CursosRepository extends BaseRepository {
    constructor() {
        super('cursos');
    }
    createAsync = async (entity) => {
        const sql = `INSERT INTO cursos (nombre) VALUES ($1) RETURNING id`;
        return await this.db.queryReturnId(sql, [entity?.nombre ?? '']);
    }
    updateAsync = async (entity) => {
        const sql = `UPDATE cursos SET nombre = $2 WHERE id = $1`;
        return await this.db.queryRowCount(sql, [entity.id, entity?.nombre ?? '']);
    }
}
```

`AlumnosRepository` igual, pero con su `createAsync`/`updateAsync` de 5 columnas.

## Para comparar con el alumno

- ✅ Los métodos comunes quedaron **en un solo lugar** (BaseRepository).
- ✅ Los `createAsync`/`updateAsync` específicos siguen claros en cada repo.
- ✅ Sigue usando `$1` para los **valores**; solo el **nombre de tabla** se interpola (y sabe por qué es seguro).
- ✅ No tocó services ni controllers.
