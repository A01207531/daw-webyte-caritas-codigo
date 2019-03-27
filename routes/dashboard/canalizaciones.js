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

can.post('/nueva', (req,res) => {
	const con = req.body.contacto;
	const tel = req.body.telefono;
	const dir = req.body.direccion;

	const query = 'INSERT INTO canalizacion(id,contacto,telefono,direccion) VALUES (DEFAULT,$1,$2,$3)';

	const values = [con,tel,dir];

	db.query(query,values, (err, resp) => {
		if(err){
			console.log(err.stack);
		  //Este error viene de la BD, por lo que solo puede ser por la
		  //violación de la llave única. 
		  res.render('dashboard/error-generico',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'Ocurrio un error al insertar la canalizacion'
		  });
		}else{
			res.render('dashboard/canalizacion-creada',{
				layout: 'dashboard-base',
				user: req.session.user,
				})
		}
	})

})



module.exports = can;