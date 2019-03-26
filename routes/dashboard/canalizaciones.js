const db = require('../../models');
const can = require('express').Router();


const phoneRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

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

	//console.log(phoneRegEx.test('(999) 998 5754'));
	
	res.render('dashboard/new-canalizacion',{
		layout: 'dashboard-base',
		user: req.session.user
	})
})



module.exports = can;