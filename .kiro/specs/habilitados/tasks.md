# Plan de implementación: Cursos habilitados

- [x] 1. Implementar `POST /habilitados`
  - Crear `src/routes/habilitados.js` con la lógica de filtrado usando `src/data/repositorio.js`
  - Montar el router en `src/app.js` en la ruta `/habilitados`
  - Tests con supertest para 1.1, 1.2, 1.3 y 1.4:
    - 1.1: `aprobados: ["1INF25","1INF27","1INF49"]` → 200 con exactamente 27 cursos, incluyendo `1INF29`, `1INF30`, `1INF31`, `1INF32`
    - 1.2: `aprobados: []` → 200 con todos los cursos sin requisitos
    - 1.3: `aprobados: ["INVALIDO"]` → 200 sin errores (código desconocido ignorado)
    - 1.4: body sin `aprobados` → 400; `aprobados` como string → 400
  - _Requisitos: 1.1, 1.2, 1.3, 1.4_
