const projectRouter = require('express').Router();

projectRouter.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	res.send("Aqui deberia aparecer una lista de usuarios")
});

projectRouter.get('/new', async (req, res) => {
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