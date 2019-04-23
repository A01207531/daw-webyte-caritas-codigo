const dash = require('express').Router();

const projRouter = require('./projects');
const benefRouter = require('./benef');
const canRouter = require('./canalizaciones.js');
const db = require('../../models');


const CONSTANTS = require('../../constants/rbac');

//append sub router
dash.use('/proyectos',projRouter);
dash.use('/beneficiarios',benefRouter);
dash.use('/canalizaciones',canRouter);


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
	else {
		let proyectos = await db.query(`SELECT * FROM proyecto WHERE id IN (SELECT proyecto_id FROM dona WHERE donante_id=${req.session.userID})`);
		proyectos = proyectos.rows;
		// res.json({ proyectos })
		res.render('dashboard/landing',{
			session: req.session,
			user: user,
			container: true,
			proyectos
		})
	}
});


module.exports = dash;