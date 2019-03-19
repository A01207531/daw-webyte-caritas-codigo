const dash = require('express').Router();

dash.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	res.json(req.session.user);
});

dash.get('/xd', async (req, res) => {
	res.send("Hello XD");
});


module.exports = dash;