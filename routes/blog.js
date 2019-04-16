const r = require('express').Router();
const db = require('../models');

r.get('/', async (req, res) => {
  let posts = await db.query('SELECT id,titulo,fotourl,fecha from posts ORDER BY fecha DESC');
  posts = posts.rows;
  const session = req.session;

  res.render('blog/list', { posts, session });
});

r.get('/:id', async (req, res) => {
  let proyecto = await db.query('SELECT * FROM proyecto WHERE id=$1', [req.params.id]);
  if(proyecto.rowCount>0) {
    proyecto = proyecto.rows[0];
  
    let [ subPrograma, municipio ] = await Promise.all([db.query('SELECT * FROM subprograma WHERE id=$1', [proyecto.subprograma_id]), db.query('SELECT * FROM municipio WHERE id=$1', [proyecto.municipio_id])]);
    proyecto.municipio = municipio.rows[0];
    // subPrograma = subPrograma.rows[0];
    
    let programa = await db.query('SELECT * FROM programa WHERE id=$1', [subPrograma.rows[0].programa_id]);
    proyecto.programa = programa.rows[0];
    proyecto.programa.subPrograma = subPrograma.rows[0];
  
    res.render('proyectos/detalle', { statys:'ok', proyecto, session: req.session });
  } else {
    res.render('404', { status:'err', err:'No se pudo encontrar el proyecto solicitado', session: req.session });
  }
});
module.exports = r;