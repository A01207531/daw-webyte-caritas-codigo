const dash = require('express').Router();

dash.get('/', async (req, res) => {
	res.send("Hello Sub router");
});

dash.get('/xd', async (req, res) => {
	res.send("Hello XD");
});


module.exports = dash;