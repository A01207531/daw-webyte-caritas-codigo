const call = require('express').Router();
call.get('/', async (req, res) => {


    res.render('contacto/index', {

    });
    // res.json(proyectos)
});
module.exports = call;