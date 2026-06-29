# Ejercicio 01 — Prompt 02: el service ✅

> 🔒 **USO DOCENTE — NO MOSTRAR A ALUMNOS.** Segundo paso de la iteración: ya revisado el repository, ahora el service.

---

## El prompt

```
Perfecto, el repository quedó bien. Ahora generá el `materias-service.js`.

Contexto: el service va entre el controller y el repository. Para `materias` no hay
reglas de negocio especiales (es un CRUD simple, como `cursos`), así que es un
pass-through: cada método llama al método correspondiente del repository.

Te paso `cursos-service.js` como referencia de estilo:

--- cursos-service.js ---
[PEGÁS EL ARCHIVO cursos-service.js]

Tarea: generá `materias-service.js` con la clase MateriasService que instancia
MateriasRepository en el constructor y expone getAllAsync, getByIdAsync, createAsync,
updateAsync y deleteByIdAsync delegando en el repository. Mismo estilo, mismos
console.log.

Todavía no hagas el controller.
```

## Por qué este segundo prompt (la iteración)

- El alumno **ya revisó** el repository del `prompt 01` antes de seguir → de a una capa.
- Mantiene **contexto** (pega `cursos-service.js`) y **restricciones** (pass-through, mismo estilo).
- Sigue conteniendo la **iteración**: "todavía no hagas el controller".

---

## Qué debería devolver la IA (respuesta modelo)

```js
import MateriasRepository from '../repositories/materias-repository.js';

export default class MateriasService {
    constructor() {
        console.log('Estoy en: MateriasService.constructor()');
        this.MateriasRepository = new MateriasRepository();
    }

    getAllAsync   = async ()       => await this.MateriasRepository.getAllAsync();
    getByIdAsync  = async (id)     => await this.MateriasRepository.getByIdAsync(id);
    createAsync   = async (entity) => await this.MateriasRepository.createAsync(entity);
    updateAsync   = async (entity) => await this.MateriasRepository.updateAsync(entity);
    deleteByIdAsync = async (id)   => await this.MateriasRepository.deleteByIdAsync(id);
}
```

(La forma exacta —flechas en una línea o con `const x = await ...; return x;`— da igual mientras delegue bien.)

## Para comparar con el alumno

- ✅ ¿Entiende **por qué** el service de `materias` es un pass-through y el de `alumnos` no?
- 🤔 Buena pregunta de oral: *"si el service no agrega nada, ¿para qué está? ¿lo sacarías?"* (engancha con el ejercicio 06). Un alumno que entendió sabe defender que la capa existe por **consistencia y para cuando aparezca una regla**.
