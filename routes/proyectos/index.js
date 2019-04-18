const router = require('express').Router();
const db = require('../../models');
const to = require('../../util/to');
const uuidv4 = require('uuid/v4');
const paypal = require('paypal-rest-sdk');

router.get('/', async (req, res) => {
  let proyectos = await db.query('SELECT * from proyecto');
  proyectos = proyectos.rows;
  const session = req.session;

  res.render('proyectos/index', { proyectos, session });
  // res.json(proyectos)
});

router.get('/:id', async (req, res) => {
  let proyecto = await db.query('SELECT * FROM proyecto WHERE id=$1', [req.params.id]);
  if(proyecto.rowCount>0) {
    proyecto = proyecto.rows[0];
  
    let [ subPrograma, municipio, totalDonadores, totalDonaciones ] = await Promise.all([
      db.query('SELECT * FROM subprograma WHERE id=$1', [proyecto.subprograma_id]), 
      db.query('SELECT * FROM municipio WHERE id=$1', [proyecto.municipio_id]),
      db.query('SELECT COUNT(nombre) FROM donasporpersona'),
      db.query('SELECT SUM(total_donado) FROM donasporpersona')
    ]);
    proyecto.municipio = municipio.rows[0];
    // subPrograma = subPrograma.rows[0];
    let programa = await db.query('SELECT * FROM programa WHERE id=$1', [subPrograma.rows[0].programa_id]);
    proyecto.programa = programa.rows[0];
    proyecto.programa.subPrograma = subPrograma.rows[0];
    
    let paypal_string = process.env.paypal_string;
    totalDonadores = totalDonadores.rows[0].count;
    totalDonaciones = totalDonaciones.rows[0].sum;

    // console.log("Donadores: ", totalDonadores, "Donaciones: ", totalDonaciones)
    res.render(
      'proyectos/detalle', 
      { 
        status:'ok', 
        proyecto, 
        session: req.session,
        totalDonadores,
        totalDonaciones, 
        paypal_string });
  } else {
    res.render('404', { status:'err', err:'No se pudo encontrar el proyecto solicitado', session: req.session });
  }
});

router.post('/:id', async (req, res) => {
  let { monto, paymentId } = req.body;
  monto = parseFloat(monto);
  console.log("---paymentID:",paymentId);
  await paypal.capture.get(paymentId, async (payerr, payment) => {
    if(req.session.userID && req.session.user.privileges.includes('realizarDonativo')) {
      if(payerr) {
        res.json({ status: 'err', payerr });
        return;
      } else {
        console.log(JSON.stringify(payment))
        let [err, data] = await to(db.query('INSERT INTO dona(id, proyecto_id, donante_id, monto) VALUES($1, $2, $3, $4)', [uuidv4(), req.params.id, req.session.userID, monto]))
        if(err) {
          res.json({status: 'err', mensaje: err});
          return;
        }
        let newData = await db.query('SELECT sum(total_donado), count(nombre) FROM donasporpersona');
        res.json({status: 'ok', newDonadores: newData.rows[0].count, newDonaciones: newData.rows[0].sum});
        return;
      }
    } 
    res.json({status: 'err', mensaje: ''});
  });
});

module.exports = router;