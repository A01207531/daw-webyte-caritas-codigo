const db = require('../../models');

const benef = require('express').Router();

benef.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
    }
    
    //Ask the beneficiaries to the db
    const bq = await db.query('SELECT nombre,apellido,curp,sexo,nacimiento FROM beneficiario');
    console.log(bq);

    //res.json(bq.rows);
	
	res.render('dashboard/list-benef',{
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
	res.send("Aqui deberia aparecer un form para crear un Beneficiario")
});

benef.get('/edit/:benefid', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
    }
    
	res.send("Aqui es para editar el proyecto " + req.params.benefid);
});

module.exports = benef;