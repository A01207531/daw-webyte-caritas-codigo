const router = require('express').Router();
const db = require('../../models');

router.get('/', async (req, res) => {
  let proyectos = await db.query('SELECT * from proyecto');
  proyectos = proyectos.rows;
  const session = req.session;

  res.render('proyectos/index', { proyectos, session });
  // res.json(proyectos)
});

router.get('/:id', async (req, res) => {
  let proyecto = await db.query('SELECT * FROM proyecto WHERE id=$1', [req.params.id]);
  proyecto = proyecto.rows[0];
  // console.log(proyecto)
  res.render('proyectos/detalle', { proyecto, session: req.session });
});
module.exports = router;