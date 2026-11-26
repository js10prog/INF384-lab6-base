# Diseño: Gates de seguridad en CI

## Visión general

Se agregan tres gates al workflow de CI (`ci.yml`) para verificar la ausencia de secretos expuestos, la ausencia de vulnerabilidades de severidad alta o crítica en dependencias, y la ausencia de patrones de código inseguros conocidos, antes de que corran los tests funcionales.

## Gates

### Gate 1 — Detección de secretos (gitleaks)

| Atributo | Valor |
| --- | --- |
| Herramienta | `gitleaks/gitleaks-action@v2` con `.gitleaks.toml` de reglas personalizadas |
| Umbral | Cualquier secreto detectado en el historial completo del repositorio (`fetch-depth: 0`) |
| Comportamiento | **Bloquea**: el job falla con exit code ≠ 0; el job `test` no se ejecuta (`needs: [secrets, sca]`) |
| Etapa | Job `secrets`, en paralelo con `sca`, antes de `test` |
| Razón | Los secretos expuestos en el historial son irreversibles; detectarlos antes de cualquier otra etapa minimiza la ventana de exposición y no requiere instalar dependencias |

**Nota sobre las reglas built-in:** `gitleaks-action@v2` solo detecta formatos de secretos conocidos (AWS keys, GitHub tokens, etc.). El proyecto usa una clave genérica (`CATALOGO_API_KEY`) cuyo valor no coincide con ninguna regla built-in, por lo que se agregó `.gitleaks.toml` con una regla custom que detecta cualquier variable con sufijo `_API_KEY` que contenga un valor de 20 o más caracteres alfanuméricos. Sin esta regla el gate no podría detectar la clave del proyecto.

**Cambio respecto a la propuesta base de Kiro:** Kiro no incluyó gate de secretos. Se agregó `gitleaks-action@v2` con `fetch-depth: 0` y una regla custom en `.gitleaks.toml`.

---

### Gate 2 — Análisis de composición (SCA) con npm audit

| Atributo | Valor |
| --- | --- |
| Herramienta | `npm audit` (incluido en npm, sin dependencia adicional) |
| Umbral | `--audit-level=high`: bloquea solo ante vulnerabilidades de severidad **high** o **critical**; moderate y low generan aviso sin fallo |
| Comportamiento | **Bloquea** si hay vulnerabilidades high/critical; avisa (exit 0) ante low/moderate |
| Etapa | Job `sca`, en paralelo con `secrets`, antes del job `test` |
| Razón | Las vulnerabilidades moderate/low en devDependencies (jest, supertest) no llegan a producción; bloquear solo en high/critical reduce el ruido sin ocultar riesgos reales. El job corre antes de `test` para no gastar tiempo en pruebas cuando hay una vulnerabilidad bloqueante |

**Cambio respecto a la propuesta base de Kiro:** Kiro no incluyó gate SCA. Se eligió `npm audit` nativo (sin tokens externos) con umbral `--audit-level=high` en lugar de `--audit-level=moderate`.

---

### Gate 3 — SAST (análisis estático de seguridad)

| Atributo | Valor |
| --- | --- |
| Herramienta | **No implementado** — ver decisión justificada abajo |
| Comportamiento | — |
| Etapa | — |

**Decisión justificada — por qué no se implementa SAST en este proyecto:**

El proyecto es una API Express de solo lectura sobre datos en memoria, sin base de datos, sin autenticación, sin entrada de usuario persistida y sin operaciones privilegiadas. Las herramientas de SAST más comunes en el ecosistema Node.js son:

| Herramienta | Por qué no aplica aquí |
| --- | --- |
| **Semgrep** (semgrep/semgrep-action) | Detecta inyecciones SQL, XSS, eval inseguro, deserialización. Este proyecto no tiene ninguno de esos patrones: no hay BD, no hay eval, no hay deserialización de entrada externa |
| **CodeQL** (github/codeql-action) | Profundo pero pesado (5–10 min); diseñado para proyectos con lógica de negocio compleja. Para 3 rutas Express de solo lectura el ruido de falsos positivos supera el valor |
| **ESLint plugin-security** | Señala uso de `child_process`, `eval`, acceso a rutas arbitrarias. El proyecto no usa ninguno de esos patrones |

La cobertura de seguridad del código queda cubierta por:
- El gate SCA (dependencias con vulns conocidas).
- El gate de secretos (credenciales en el historial).
- Los tests de integración con supertest que verifican que los 400/404 se manejan correctamente.

Si en el futuro se agrega autenticación, BD, o procesamiento de archivos del usuario, se recomienda añadir Semgrep con el ruleset `p/nodejs` como gate adicional.

---

## Dependencias entre jobs

```
secrets ─┐
          ├─► test
sca     ─┘
```

Los jobs `secrets` y `sca` corren en paralelo. `test` solo arranca si ambos pasan.
