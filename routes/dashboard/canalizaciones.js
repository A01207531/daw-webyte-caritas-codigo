const db = require('../../models');
const can = require('express').Router();

function validatePhone(phone){
	const l = phone.legth;
	for(var i = 0; i < l; i++){
		if(!(phone[i] in "0123456789 ()-+")){
			return false;
		}
	}

	return true;
}

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

can.post('/nueva', async (req,res) => {
	res.json(req.body);
	console.log(validatePhone('9999985754'));
})



module.exports = can;