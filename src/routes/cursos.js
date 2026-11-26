const { Router } = require('express');
const repositorio = require('../data/repositorio');

const router = Router();

// GET /cursos?ciclo=N
router.get('/', (req, res) => {
  const { ciclo } = req.query;

  if (ciclo !== undefined) {
    const cicloNum = Number(ciclo);
    if (!Number.isInteger(cicloNum) || cicloNum < 5 || cicloNum > 10) {
      return res.status(400).json({ error: 'ciclo debe ser un entero entre 5 y 10' });
    }
    return res.json(repositorio.listarPorCiclo(cicloNum));
  }

  res.json(repositorio.listar());
});

// GET /cursos/:codigo
router.get('/:codigo', (req, res) => {
  const curso = repositorio.obtener(req.params.codigo);

  if (!curso) {
    return res.status(404).json({ error: 'curso no encontrado' });
  }

  // Resolve prerequisite codes to { id, name } objects
  const prerequisites = (curso.prerequisites || []).map((id) => {
    const req = repositorio.obtener(id);
    return req ? { id: req.id, name: req.name } : { id, name: null };
  });

  res.json({ ...curso, prerequisites });
});

module.exports = router;
