const router = require('express').Router();
const db = require('../../../models');

// router.get('/', async (req, res) => {
//   let beneficiarios = await db.query('SELECT * from beneficiario');
//   beneficiarios = beneficiarios.rows;
//   const session = req.session;

//   res.render('beneficiario/index', { beneficiarios, session });
//   // res.json(proyectos)
// });

router.get('/:id', async (req, res) => {
  let beneficiario = await db.query('SELECT * FROM beneficiario WHERE id=$1', [req.params.id]);
  beneficiario = beneficiario.rows[0];
  console.log(beneficiario)
  res.render('dashboard/beneficiarios/detalle', { beneficiario, session: req.session });
});
module.exports = router;