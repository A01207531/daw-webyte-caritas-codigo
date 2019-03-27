const router = require('express').Router();
const db = require('../../models');


router.get('/:id', async (req, res) => {
  let beneficiario = await db.query('SELECT * FROM beneficiario WHERE id=$1', [req.params.id]);
  beneficiario = beneficiario.rows[0];
  // console.log(beneficiario)
  res.render('dashboard/beneficiarios/detail', { beneficiario, session: req.session,layout:"dashboard-base",user: req.session.user });
});
module.exports = router;