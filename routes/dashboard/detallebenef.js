const benef = require('express').Router();
benef.get('/', async (req, res) => {

    
    res.render('beneficiario/index', {

    });

});
module.exports = benef;