# Diseño: Cursos habilitados

## Visión general

Endpoint `POST /habilitados` que reutiliza el repositorio existente (`src/data/repositorio.js`) para calcular en memoria cuáles cursos puede matricular el alumno.

## Componentes

| Componente | Responsabilidad |
| --- | --- |
| `src/data/repositorio.js` | Ya expone `listar()`. No requiere cambios. |
| `src/routes/habilitados.js` | Define `POST /habilitados`. Valida el body, calcula los habilitados y devuelve la respuesta. |
| `src/app.js` | Monta el nuevo router en `/habilitados`. |

## Algoritmo

```
aprobadosSet = new Set(aprobados)
habilitados = listar()
  .filter(curso =>
    !aprobadosSet.has(curso.id) &&
    curso.prerequisites.every(p => aprobadosSet.has(p.id))
  )
```

Complejidad: O(n) sobre los 87 cursos; sin necesidad de caché adicional.

## Contrato

`POST /habilitados`

Request body:
```json
{ "aprobados": ["1INF25", "1INF27", "1INF49"] }
```

Response `200` — arreglo de cursos habilitados (misma forma que `GET /cursos`):
```json
[
  { "id": "1INF29", "name": "Bases de Datos", "credits": 4.0, "cycle": 6, "type": "obligatorio" },
  { "id": "1INF30", "name": "Programación 3", "credits": 5.0, "cycle": 6, "type": "obligatorio" }
]
```

Con `aprobados: ["1INF25", "1INF27", "1INF49"]` la respuesta contiene exactamente 27 cursos.

## Manejo de errores

| Caso | Respuesta |
| --- | --- |
| Body sin `aprobados` o `aprobados` no es arreglo | `400 { "error": "aprobados debe ser un arreglo de códigos" }` |
| Error interno no controlado | `500 { "error": "error interno del servidor" }` (manejado por el middleware global de `src/app.js`) |

## Estrategia de pruebas

- Tests de ruta con supertest, uno o más por criterio de aceptación.
- Verificar el conteo exacto (27) y la presencia de cursos representativos con el ejemplo canónico.
- Verificar que un arreglo vacío devuelve todos los cursos sin requisitos.
