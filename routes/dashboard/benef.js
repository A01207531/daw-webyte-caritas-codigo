const db = require('../../models');

const benef = require('express').Router();

benef.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
    }
    
    //Ask the beneficiaries to the db
    const bq = await db.query('SELECT nombre,apellido,curp,sexo,nacimiento,id FROM beneficiario');

    //res.json(bq.rows);
	
	res.render('dashboard/beneficiarios/list-benef',{
		layout: 'dashboard-base',
        user: req.session.user,
        benef: bq.rows
	});
});

benef.get('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	

	res.render('dashboard/new-benef',{
		layout: 'dashboard-base'
	});

});

benef.post('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	res.json(req.body);

});

benef.get('/editar/:benefid', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
  }
    
	res.send("Aqui es para editar el beneficiario " + req.params.benefid);
});

module.exports = benef;