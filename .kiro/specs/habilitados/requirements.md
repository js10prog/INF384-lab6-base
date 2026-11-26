# Requisitos: Cursos habilitados

## Introducción

Funcionalidad para calcular qué cursos puede matricular un alumno dado el conjunto de cursos que ya aprobó. Un curso está habilitado si no fue aprobado y todos sus requisitos figuran entre los aprobados (un curso sin requisitos siempre está habilitado).

## Requisitos

### Requisito 1: Calcular cursos habilitados

**Historia de usuario:** Como alumno, quiero saber qué cursos puedo matricular este ciclo, para armar mi horario sin errores de requisitos.

#### Criterios de aceptación

1.1 CUANDO se envíe `POST /habilitados` con un arreglo `aprobados` de códigos válidos, EL sistema DEBE devolver los cursos no aprobados cuyos requisitos están todos incluidos en `aprobados`.

1.2 CUANDO un curso no tiene requisitos y no fue aprobado, EL sistema DEBE incluirlo en la respuesta.

1.3 CUANDO el arreglo `aprobados` incluye cursos que no existen en la malla, EL sistema DEBE ignorarlos sin error.

1.4 CUANDO el cuerpo de la solicitud no incluye el campo `aprobados` o no es un arreglo, EL sistema DEBE responder 400 con un mensaje de error.

### Requisito 2: Calidad del servicio

**Historia de usuario:** Como alumno, quiero un servicio confiable, para consultar mis habilitados sin problemas.

#### Criterios de aceptación

2.1 El sistema debe manejar los errores de forma segura sin exponer detalles internos.
