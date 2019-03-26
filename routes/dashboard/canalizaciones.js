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
		
    //por mientras
    res.render('dashboard/list-canalizaciones',{
			layout: 'dashboard-base',
			user: req.session.user,
			canalizaciones: cq.rows
		})
})



module.exports = can;