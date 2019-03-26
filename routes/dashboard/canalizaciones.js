const db = require('../../models');
const can = require('express').Router();

can.get('/', async (req,res) => {
    if(!req.session.userID){
		res.redirect("/login");
		return;
		}
		
		//En esta hacemos un query sencillo a las canalizaciones
		const cq = await db.query('SELECT * FROM canalizacion ORDER BY contacto');

		console.log(cq.rows);
		
    //Listar los datos obtenidos
    res.render('dashboard/list-canalizaciones',{
			layout: 'dashboard-base',
			user: req.session.user,
			canalizaciones: cq.rows
		})
})


can.get('/nueva', async (req,res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	
	res.render('dashboard/new-canalizacion',{
		layout: 'dashboard-base',
		user: req.session.user
	})
})



module.exports = can;