const db = require('../../models');
const pr = require('express').Router();

pr.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	//Ask the projects to the db
	const pq = await db.query('SELECT nombre,descripcion,inicio,final,estatus,id FROM proyecto');
	
	console.log(pq);

	res.render('dashboard/proyectos/list',{
		layout: 'dashboard-base',
		user: req.session.user,
		proj: pq.rows
	})
});

pr.get('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	res.render('dashboard/proyectos/create',{
		layout: 'dashboard-base',
		user: req.session.user,
	})
});

function progCat(prog,cat){
	console.log("Asociando el programa con id " + prog + " con " + cat);
}


pr.post('/nuevo', (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	const query = 'INSERT INTO proyecto(id,nombre,descripcion,inicio,final,estatus,responsable,observaciones,subprograma_id,municipio_id,direccion,solicitado) VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';

	const p = req.body; //p de post

	const sol = p.solicitado;

	const responsable = req.session.userID;

	const values = [p.name,p.desc,p.inicio,p.final,p.status,responsable,p.observation,p.sub,p.city,p.address,sol];
	console.log(p)
	//res.json(p);

	db.query(query, values, (err, resp) => {
		if (err) {
		  console.log(err.stack);
		  //Este error viene de la BD, por lo que solo puede ser por la
		  //violación de la llave única. 
		  res.render('dashboard/errors/generic',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'El error se debe a que los datos no son validos. Es posible que el nombre del proyecto ya exista.'
		  });
		} else {
		//El proyecto se creo. Ahora aqui hay que hacer un for
		p.categorias.forEach(cat => {
			//hacer el insert aqui
			console.log("aqui insertamos el registro de un id con la categoria");
		});
		  res.render('dashboard/proyectos/success',{
			layout: 'dashboard-base',
			user: req.session.user,
		  })
		}
	  })
});

pr.get('/editar/:projectid', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	
	res.send("Aqui es para editar el proyecto " + req.params.projectid);
});


pr.get('/programAPI',async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	const q = await db.query("SELECT * FROM resumen_programas");

	res.json(q.rows);
})

module.exports = pr;