const router = require('express').Router();
const db = require('../../models');

router.get('/', async (req, res) => {
  let proyectos = await db.query('SELECT * from proyecto');
  proyectos = proyectos.rows;

  res.render('proyectos/index', { proyectos });
  // res.json(proyectos)
});

module.exports = router;