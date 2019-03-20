const benef = require('express').Router();

benef.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	
	res.render('dashboard/list-benef',{
		layout: 'dashboard-base',
		user: req.session.user
	})
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