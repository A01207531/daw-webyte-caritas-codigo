const dash = require('express').Router();

const projRouter = require('./projects');
const benefRouter = require('./benef');

//append sub router
dash.use('/proyectos',projRouter);
dash.use('/beneficiarios',benefRouter);

dash.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	res.render('dashboard/landing',{
		layout: 'dashboard-base',
		user: req.session.user
	})
});


module.exports = dash;