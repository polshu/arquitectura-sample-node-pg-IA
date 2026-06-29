# 🔒 Material de uso docente — NO mostrar a los alumnos

Esta carpeta contiene material de **corrección y referencia** del TP de Prompting. **No se entrega ni se muestra a los alumnos.**

## Qué hay acá

| Archivo | Para qué sirve |
|---------|----------------|
| `GUIA-DOCENTE - Rubrica y verificacion.md` | Rúbrica, verificación técnica por ejercicio y preguntas "mata-IA" para el oral. |
| `01 - Nueva tabla y su CRUD - prompt 00 (MAL).md` | Ejemplo de un prompt **mal hecho** y por qué falla. |
| `01 - Nueva tabla y su CRUD - prompt 01.md` … `prompt 04.md` | Una **secuencia modelo** de prompts buenos, iterando de a una capa, incluida una iteración donde la IA se equivoca y el alumno la corrige. |

## Cómo usar los ejemplos de prompts (ejercicio 01)

Estos archivos son una **respuesta modelo del proceso de prompteo**, no del código (el código ya existe). La idea **no** es que el alumno reproduzca estos prompts textualmente —cada uno promptea distinto—, sino tener una vara para comparar.

En el oral:

1. Pedile al alumno que te muestre **los prompts que usó** (su bitácora).
2. Compará contra esta secuencia modelo:
   - ¿Incluyó **contexto** (pegó código de referencia) y **restricciones**? → comparar con `prompt 01`.
   - ¿Iteró **de a una capa** o pidió todo de un saque? → comparar con la progresión `01 → 02 → 03`.
   - ¿**Detectó y corrigió** algo que la IA hizo mal? → comparar con `prompt 04`.
3. Si su primer prompt se parece al `prompt 00 (MAL)` y lo pegó sin revisar → 🔴 señal de "usó IA sin entender".

> 💡 No evaluamos si los prompts son idénticos a estos. Evaluamos si el alumno **entendió por qué** un buen prompt lleva rol/contexto/tarea/restricciones/iteración, y si **leyó críticamente** lo que la IA le devolvió.
