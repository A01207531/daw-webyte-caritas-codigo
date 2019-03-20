const db = require('../../models');
const projectRouter = require('express').Router();

projectRouter.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	//Ask the projects to the db
	const pq = await db.query('SELECT nombre,descripcion,inicio,final,estatus,id FROM proyecto');
	
	console.log(pq);

	res.render('dashboard/list-projects',{
		layout: 'dashboard-base',
		user: req.session.user,
		proj: pq.rows
	})
});

projectRouter.get('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	res.send("Aqui deberia aparecer un form para crear un proyecto")
});

projectRouter.get('/edit/:projectid', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
    }
    
	res.send("Aqui es para editar el proyecto " + req.params.projectid);
});

module.exports = projectRouter;