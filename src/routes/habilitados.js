const { Router } = require('express');
const repositorio = require('../data/repositorio');

const router = Router();

// POST /habilitados
router.post('/', (req, res) => {
  const { aprobados } = req.body;

  if (!Array.isArray(aprobados)) {
    return res.status(400).json({ error: 'aprobados debe ser un arreglo de códigos' });
  }

  const aprobadosSet = new Set(aprobados);

  const habilitados = repositorio.listar().filter((curso) =>
    !aprobadosSet.has(curso.id) &&
    (curso.prerequisites || []).every((p) => aprobadosSet.has(p))
  );

  res.json(habilitados);
});

module.exports = router;
