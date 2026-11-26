# Trazabilidad

## Requisito → gate → evidencia

| Requisito | Gate (herramienta y umbral) | Bloquea / avisa | Etapa | Run fallido | Run corregido |
| --- | --- | --- | --- | --- | --- |
| **consulta-cursos 1.1–1.3** `GET /cursos` devuelve cursos correctos y valida `ciclo` | Jest / supertest — `npm test` | Bloquea (exit ≠ 0 rompe job `test`) | Job `test` | <!-- URL run fallido antes de implementar GET /cursos --> | <!-- URL run corregido --> |
| **consulta-cursos 2.1–2.2** `GET /cursos/:codigo` detalle y 404 | Jest / supertest — `npm test` | Bloquea | Job `test` | <!-- URL run fallido --> | <!-- URL run corregido --> |
| **habilitados 1.1–1.4** `POST /habilitados` filtra correctamente y valida body | Jest / supertest — `npm test` | Bloquea | Job `test` | <!-- URL run fallido --> | <!-- URL run corregido --> |
| **Secretos en repositorio** (ej. API key en `config/ejemplo.env`) | gitleaks — cualquier secreto en historial | **Bloquea** (job `secrets` falla; `test` no arranca) | Job `secrets` (paralelo, antes de `test`) | <!-- URL run donde gitleaks detectó CATALOGO_API_KEY --> | <!-- URL run corregido (valor reemplazado por placeholder) --> |
| **Vulnerabilidades high/critical en dependencias** | npm audit — `--audit-level=high` | **Bloquea** si severity ≥ high; avisa en low/moderate | Job `sca` (paralelo, antes de `test`) | <!-- URL run donde npm audit falla por vuln high --> | <!-- URL run corregido --> |

> **Cómo completar los placeholders:** después de hacer `git push`, abre https://github.com/js10prog/INF384-lab6-base/actions/workflows/ci.yml, copia la URL del run fallido y del run corregido para cada fila.

## Cambios a la propuesta de Kiro

| Documento | Qué propuso Kiro | Qué cambiaste | Por qué |
| --- | --- | --- | --- |
| `ci.yml` | Un solo job `build` que solo instala y corre `npm test`; sin gates de seguridad | Se agregó el job `secrets` (gitleaks) corriendo en paralelo con el nuevo job `sca` (npm audit); el job `test` pasa a depender de ambos con `needs: [secrets, sca]` | El workflow original no verificaba la ausencia de secretos ni el estado de las dependencias, dejando vectores de riesgo sin cobertura en el pipeline |
| `ci.yml` — umbral SCA | Kiro no propuso ningún gate SCA | Se usó `--audit-level=high` en lugar de `--audit-level=moderate` | El nivel `moderate` genera falsos positivos en devDependencies (jest, supertest) que nunca llegan a producción; `high` cubre riesgos reales sin ruido |
