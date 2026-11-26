# Trazabilidad

## Requisito → gate → evidencia

| Requisito | Gate (herramienta y umbral) | Bloquea / avisa | Etapa | Run fallido | Run corregido |
| --- | --- | --- | --- | --- | --- |
| **consulta-cursos 1.1–1.3** `GET /cursos` devuelve cursos correctos y valida `ciclo` | Jest / supertest — `npm test` | Bloquea (exit ≠ 0 rompe job `test`) | Job `test` | <!-- URL run fallido antes de implementar GET /cursos --> | <!-- URL run corregido --> |
| **consulta-cursos 2.1–2.2** `GET /cursos/:codigo` detalle y 404 | Jest / supertest — `npm test` | Bloquea | Job `test` | <!-- URL run fallido --> | <!-- URL run corregido --> |
| **habilitados 1.1–1.4** `POST /habilitados` filtra correctamente y valida body | Jest / supertest — `npm test` | Bloquea | Job `test` | <!-- URL run fallido --> | <!-- URL run corregido --> |
| **Secretos en repositorio** | gitleaks — cualquier secreto en historial | **Bloquea** (job `secrets` falla; `test` no arranca) | Job `secrets` (paralelo, antes de `test`) | N/A — `config/ejemplo.env` no está trackeado (excluido por `.gitignore`); gitleaks pasó correctamente | [Run #1](https://github.com/js10prog/INF384-lab6-base/actions/runs/45903521484) — gitleaks pasó |
| **Vulnerabilidades high/critical en dependencias** | npm audit — `--audit-level=high` | **Bloquea** si severity ≥ high; avisa en low/moderate | Job `sca` (paralelo, antes de `test`) | [Run #1](https://github.com/js10prog/INF384-lab6-base/actions/runs/45903521484) — `lodash 4.17.20` tiene 4 vulns high (Command Injection, ReDoS, Code Injection, Prototype Pollution) | <!-- URL run corregido después de actualizar lodash a 4.18.1 --> |

> **Para completar el run corregido del gate SCA:** después de hacer `git push` con `lodash@4.18.1`, copia la URL del nuevo run exitoso en la última celda.

## Cambios a la propuesta de Kiro

| Documento | Qué propuso Kiro | Qué cambiaste | Por qué |
| --- | --- | --- | --- |
| `ci.yml` | Un solo job `build` que solo instala y corre `npm test`; sin gates de seguridad | Se agregó el job `secrets` (gitleaks) corriendo en paralelo con el nuevo job `sca` (npm audit); el job `test` pasa a depender de ambos con `needs: [secrets, sca]` | El workflow original no verificaba la ausencia de secretos ni el estado de las dependencias, dejando vectores de riesgo sin cobertura en el pipeline |
| `ci.yml` — umbral SCA | Kiro no propuso ningún gate SCA | Se usó `--audit-level=high` en lugar de `--audit-level=moderate` | El nivel `moderate` genera falsos positivos en devDependencies (jest, supertest) que nunca llegan a producción; `high` cubre riesgos reales sin ruido |
