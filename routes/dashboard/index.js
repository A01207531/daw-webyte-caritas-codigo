const dash = require('express').Router();

const proj = require('./projects');

//append sub router
dash.use('/proyectos',proj);

dash.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	res.render('dashboard/landing',{
		layout: 'dashboard-base'
	})
});


module.exports = dash;