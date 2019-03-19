require('dotenv').config();

const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./models');
const bcrypt = require('bcryptjs');

const dashboardRouter = require('./routes/dashboard');
const app = express();

// Middleware
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// add & configure middleware
app.use(session({
	secret: process.env.randomkey,
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 24*3600*1000,
		sameSite: true
	}
  }))

//Sub route for the dashboard
app.use("/dashboard",dashboardRouter);

// Setup View Engine

//Topi te pasas con los modulos
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');

app.engine('hbs', hbs({
	extname: 'hbs',
	defaultLayout: 'base',
	layoutsDir: path.join(__dirname, 'views', 'layouts'),
	partialsDir: path.join(__dirname, 'views', 'partials')
}));

app.locals.title = 'Cáritas de Querétaro';

//Index
app.get('/', async (req, res) => {
	const query = await db.query('SELECT nombre,descripcion FROM proyecto');
	//console.log(query);
	const data = query.rows;
	//console.log(data);
	res.render('index.hbs',{projects: data});
});

//Login: GET & POST
app.get('/login', (req,res) => {
	res.render('login.hbs');
});

app.post('/login', async (req,res) => {
	//get data
	const username = req.body.email;
	const pass = req.body.password;

	if(!(username && pass)){
		res.render('login.hbs');
		return;
	}

	//We have data
	//consult the db
	const q = await db.query('SELECT id,nombre,apellido,passhash FROM usuario WHERE login=$1',[username]);

	if(!q || q.rowCount != 1){
		res.send("No existe tal usuario");
		return;
	}

	const userData = q.rows[0];

	//console.log(userData);

	const hash = userData.passhash;
	//verify the password

	if(bcrypt.compareSync(pass,hash)){
		//Successfull auth
		req.session.userID = userData.id;

		//get the RBAC privileges right now
		const privq = await db.query('SELECT priv FROM usuario_privilegio WHERE login=$1',[username]);

		req.session.user = {
			name: userData.nombre,
			lastname: userData.apellido,
			fullName: userData.nombre + " " +userData.apellido,
			privileges: []
		}

		//only push the strings
		privq.rows.forEach(p => {
			req.session.user.privileges.push(p.priv);
		});

		//we officially have the session with the privileges
		res.redirect("/dashboard");
	}else{
		res.send("Credenciales incorrectas");
	}
	
});

//para el azure
const port=process.env.PORT || 3000

app.listen(port);