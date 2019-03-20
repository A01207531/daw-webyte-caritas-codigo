const router = require('express').Router();

router.get('/', async (req, res) => {

  const proyectos = [
    { nombre: 'Cualquier cosita', descripcion: 'ESta es la descripción del proyecto 1.' },
    { nombre: 'Proyecto 2', descripcion: 'ESta es la descripción del proyecto 2.' },    
    { nombre: 'Proyecto 3', descripcion: 'ESta es la descripción del proyecto 3.' },    
  ];

  res.render('proyectos/index', { proyectos });
});

module.exports = router;