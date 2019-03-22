const router = require('express').Router();
const db = require('../../models');

router.get('/', async (req, res) => {
  let proyectos = await db.query('SELECT * from proyecto');
  proyectos = proyectos.rows;

  res.render('proyectos/index', { proyectos });
  // res.json(proyectos)
});

router.get('/:id', async (req, res) => {
  let proyecto = await db.query('SELECT * FROM proyecto WHERE id=$1', [req.params.id]);
  proyecto = proyecto.rows[0];
  console.log(proyecto)
  res.render('proyectos/detalle', { proyecto });
});
module.exports = router;