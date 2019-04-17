const db = require('../../models');
const r = require('express').Router();

//esto deberia listar los posts en una tabla
r.get('/', async (req,res) => {
    if(!req.session.userID){
			res.redirect("/login");
			return;
		}
		
		//En esta hacemos un query sencillo a las canalizaciones
		const cq = await db.query('SELECT id,titulo,fecha FROM posts ORDER BY fecha');

		console.log(cq.rows);
		
    //Listar los datos obtenidos
    /*res.render('dashboard/canalizaciones/list',{
			layout: 'dashboard-base',
			user: req.session.user,
			canalizaciones: cq.rows
        })*/
    res.json(cq.rows);
})


//Esto es un formulario para crear un nuevo post
r.get('/nuevo', async (req,res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	//console.log(phoneRegEx.test('(999) 998 5754'));
	
	res.render('dashboard/canalizaciones/create',{
		layout: 'dashboard-base',
		user: req.session.user
	})
})

//esto es el endpoint del form
r.post('/nuevo', (req,res) => {
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
		  res.render('dashboard/errors/generic',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'Ocurrio un error al insertar la canalizacion'
		  });
		}else{
			res.render('dashboard/canalizaciones/success',{
				layout: 'dashboard-base',
				user: req.session.user,
				})
		}
	})

})



module.exports = r;