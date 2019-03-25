const can = require('express').Router();

can.get('/', (req,res) => {
    if(!req.session.userID){
		res.redirect("/login");
		return;
    }
    
    //por mientras
    res.render('dashboard/list-canalizaciones',{
		layout: 'dashboard-base',
		user: req.session.user
	})
})



module.exports = can;