const request = require('supertest');
const app = require('../src/app');

// ── Requisito 1: Calcular cursos habilitados ────────────────────────────────

describe('POST /habilitados', () => {
  // 1.1 – Arreglo de aprobados válidos → cursos habilitados correctos
  test('1.1 con aprobados canónicos devuelve exactamente 27 cursos incluyendo 1INF29, 1INF30, 1INF31, 1INF32', async () => {
    const res = await request(app)
      .post('/habilitados')
      .send({ aprobados: ['1INF25', '1INF27', '1INF49'] });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(27);

    const ids = res.body.map((c) => c.id);
    expect(ids).toContain('1INF29');
    expect(ids).toContain('1INF30');
    expect(ids).toContain('1INF31');
    expect(ids).toContain('1INF32');
  });

  // 1.2 – Arreglo vacío → solo cursos sin requisitos
  test('1.2 con aprobados vacío devuelve todos los cursos sin requisitos', async () => {
    const res = await request(app)
      .post('/habilitados')
      .send({ aprobados: [] });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Every returned course must have no prerequisites
    for (const curso of res.body) {
      expect(curso.prerequisites).toEqual([]);
    }

    // No course with prerequisites should appear
    const ids = res.body.map((c) => c.id);
    expect(ids).not.toContain('1INF30'); // has prerequisite 1INF25
  });

  // 1.3 – Código desconocido en aprobados → ignorado sin error
  test('1.3 con un código inválido en aprobados responde 200 sin error', async () => {
    const res = await request(app)
      .post('/habilitados')
      .send({ aprobados: ['INVALIDO'] });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 1.4 – Body sin aprobados → 400
  test('1.4 body sin campo aprobados responde 400', async () => {
    const res = await request(app)
      .post('/habilitados')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'aprobados debe ser un arreglo de códigos' });
  });

  // 1.4 – aprobados como string → 400
  test('1.4 aprobados como string responde 400', async () => {
    const res = await request(app)
      .post('/habilitados')
      .send({ aprobados: '1INF25' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'aprobados debe ser un arreglo de códigos' });
  });
});
