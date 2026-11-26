const request = require('supertest');
const app = require('../src/app');

// ── Requisito 1: Listar cursos ──────────────────────────────────────────────

describe('GET /cursos', () => {
  // 1.1 – Devuelve todos los cursos con los campos del modelo
  test('1.1 devuelve todos los cursos con código, nombre, créditos, ciclo y tipo', async () => {
    const res = await request(app).get('/cursos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(87);

    for (const curso of res.body) {
      expect(curso).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          credits: expect.any(Number),
          type: expect.stringMatching(/^(obligatorio|electivo)$/),
        }),
      );
    }
  });

  // 1.2 – Filtra por ciclo
  test('1.2 con ?ciclo=10 devuelve solo los 3 cursos del ciclo 10', async () => {
    const res = await request(app).get('/cursos?ciclo=10');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.every((c) => c.cycle === 10)).toBe(true);
  });

  // 1.3 – Ciclo inválido → 400
  test('1.3 con ?ciclo=abc responde 400', async () => {
    const res = await request(app).get('/cursos?ciclo=abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });

  test('1.3 con ?ciclo=4 responde 400 (fuera de rango)', async () => {
    const res = await request(app).get('/cursos?ciclo=4');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });

  test('1.3 con ?ciclo=11 responde 400 (fuera de rango)', async () => {
    const res = await request(app).get('/cursos?ciclo=11');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ciclo debe ser un entero entre 5 y 10' });
  });
});

// ── Requisito 2: Detalle de un curso ───────────────────────────────────────

describe('GET /cursos/:codigo', () => {
  // 2.1 – Curso existente con requisitos resueltos
  test('2.1 devuelve 1INF30 con su requisito 1INF25 resuelto a { id, name }', async () => {
    const res = await request(app).get('/cursos/1INF30');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: '1INF30',
      name: 'Programación 3',
      cycle: 6,
    });
    expect(res.body.prerequisites).toEqual([{ id: '1INF25', name: 'Programación 2' }]);
  });

  test('2.1 devuelve un curso sin requisitos con prerequisites vacío', async () => {
    const res = await request(app).get('/cursos/1INF25');

    expect(res.status).toBe(200);
    expect(res.body.prerequisites).toEqual([]);
  });

  // 2.2 – Código inexistente → 404
  test('2.2 código inexistente responde 404', async () => {
    const res = await request(app).get('/cursos/XXX999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'curso no encontrado' });
  });
});
