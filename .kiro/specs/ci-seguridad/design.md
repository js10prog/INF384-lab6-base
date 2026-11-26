# Diseño: Gates de seguridad en CI

## Visión general

Se agregan dos gates al workflow de CI (`ci.yml`) para verificar la ausencia de secretos expuestos y la ausencia de vulnerabilidades de severidad alta o crítica en dependencias, antes de que corran los tests funcionales.

## Gates

### Gate 1 — Detección de secretos (gitleaks)

| Atributo | Valor |
| --- | --- |
| Herramienta | `gitleaks/gitleaks-action@v2` |
| Umbral | Cualquier secreto detectado en el historial completo del repositorio (`fetch-depth: 0`) |
| Comportamiento | **Bloquea**: el job falla con exit code ≠ 0; el job `test` no se ejecuta (`needs: [secrets, sca]`) |
| Etapa | Job `secrets`, primer job del pipeline, antes de instalar dependencias |
| Razón | Los secretos expuestos en el historial son irreversibles; detectarlos antes de cualquier otra etapa minimiza la ventana de exposición y no requiere instalar nada (solo el checkout) |

**Cambio respecto a la propuesta base de Kiro:** Kiro no incluyó ningún gate de secretos. Se agregó `gitleaks-action@v2` con `fetch-depth: 0` para escanear el historial completo, no solo el commit actual.

---

### Gate 2 — Análisis de composición (SCA) con npm audit

| Atributo | Valor |
| --- | --- |
| Herramienta | `npm audit` (incluido en npm, sin dependencia adicional) |
| Umbral | `--audit-level=high`: bloquea solo ante vulnerabilidades de severidad **high** o **critical**; las de moderate y low generan aviso sin fallo |
| Comportamiento | **Bloquea** si hay vulnerabilidades high/critical; avisa (exit 0) ante low/moderate |
| Etapa | Job `sca`, en paralelo con `secrets`, antes del job `test` |
| Razón | Las vulnerabilidades moderate/low en dependencias de desarrollo (jest, supertest) son habituales y no representan riesgo en producción; bloquear solo en high/critical reduce el ruido sin ocultar riesgos reales. El job corre antes de `test` para no gastar tiempo en pruebas cuando hay una vulnerabilidad bloqueante |

**Cambio respecto a la propuesta base de Kiro:** Kiro no incluyó ningún gate SCA. Se eligió `npm audit` nativo (cero dependencias adicionales) con umbral `--audit-level=high` en lugar de herramientas externas (Snyk, OWASP DC), para mantener el pipeline reproducible sin tokens externos.

## Dependencias entre jobs

```
secrets ─┐
          ├─► test
sca     ─┘
```

Los jobs `secrets` y `sca` corren en paralelo. `test` solo arranca si ambos pasan.
