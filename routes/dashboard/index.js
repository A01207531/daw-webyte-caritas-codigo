const dash = require('express').Router();

const projRouter = require('./projects');
const benefRouter = require('./benef');
const canRouter = require('./canalizaciones.js');
const blogAdminRouter = require('./blogadmin');

const CONSTANTS = require('../../constants/rbac');

//append sub router
dash.use('/proyectos',projRouter);
dash.use('/beneficiarios',benefRouter);
dash.use('/canalizaciones',canRouter);
dash.use('/blog',blogAdminRouter);

dash.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	const user = req.session.user;
	console.log(user);
	if(user.privileges.some(r => [CONSTANTS.CREATE_BOX, CONSTANTS.CREATE_PROJECT, CONSTANTS.CREATE_USER].indexOf(r) >= 0))
		res.render('dashboard/landing',{
			layout: 'dashboard-base',
			user: user
		})
	else 
		res.render('dashboard/landing',{
			session: req.session,
			user: user,
			container: true
		})
});


module.exports = dash;