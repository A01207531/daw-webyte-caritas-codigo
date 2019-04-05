const router = require('express').Router();
const db = require('../../models');


router.get('/:id', async (req, res) => {
    let contenedor = await db.query('SELECT * FROM caja WHERE id=$1', [req.params.id]);
    contenedor = contenedor.rows[0];
    // console.log(contenedor)
    let key = process.env.key;
    res.render('contenedor/index', {
        contenedor,
        session: req.session,
        key
    });
});
module.exports = router;