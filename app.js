require('dotenv').config();

const express = require('express');
const hbs = require('express-handlebars');
// var extend = require('handlebars-extend-block');
// hbs = extend(hbs);
//To format the date
//hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./models');
const bcrypt = require('bcryptjs');

const dashboardRouter = require('./routes/dashboard');
const proyectRouter = require('./routes/proyectos');

const to = require('./util/to');

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
}));

//Sub route for the dashboard
app.use("/dashboard", dashboardRouter);
app.use('/proyectos', proyectRouter);

// Setup View Engine

//Topi te pasas con los modulos
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');

app.engine('hbs', hbs({
	extname: 'hbs',
	defaultLayout: 'base',
	layoutsDir: path.join(__dirname, 'views', 'layouts'),
	partialsDir: path.join(__dirname, 'views', 'partials'),
	helpers: {
		dateFormat: require('handlebars-dateformat'),
		// extend: require('handlebars-extend-block')
	}
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
		res.render('login.hbs',{
			error: "No debes introducir datos en blanco"
		});
		return;
	}
<<<<<<< HEAD

	//We have data
	//consult the db
	const q = await db.query('SELECT id,nombre,apellido,passhash FROM usuario WHERE login=$1 OR email=$1',[username]);
=======
	const q = await db.query('SELECT id,nombre,apellido,passhash FROM usuario WHERE login=$1',[username]);
>>>>>>> f839d701b867fdc28bc8b9a625ecd6cd3d042bca

	if(!q || q.rowCount != 1){
		res.render('login.hbs',{
			error: "El usuario introducido no existe"
		});
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
		res.redirect("/dashboard/");
	}else{
		res.render('login.hbs',{
			error: "La contraseña es incorrecta"
		});
	}
	
});

app.get('/registro', async (req, res) => {
	res.render('registro', {session: req.session});
	// res.json(await db.query('SELECT * FROM privilegio'));
});

app.post('/registro', async (req, res) => {

	const { username, name, lastname, email, password, password2 } = req.body;

	// Revisamos que el usuario haya ingresado todos sus datos
	if(username && name && lastname && email && password && password2) {
		// Revisamos que las contraseñas coincidan
		if(password === password2) {
			// Buscamos si el nombre de usuario o correo ya está registrado
			const posibleUser = await db.query('SELECT * FROM usuario WHERE login=$1 OR email=$2', [username, email]);
			// Si no está registrado, continuamos 👍
			if(posibleUser.rowCount === 0) {
				const salt = bcrypt.genSaltSync(8);
				const passHash = bcrypt.hashSync(password, salt);
				
				// Creamos el Usuario
				const result = await db.query('INSERT INTO usuario (login, passHash, nombre, apellido, email) VALUES ($1, $2, $3, $4, $5)', [username, passHash, name, lastname, email]);
				// const result2 = await db.query('INSERT INTO usuario_privilegio (login, priv) VALUES ($1, $2)', [username, 'realizarDonativo']);

				res.json({ result, status: 'ok' });
				return;

			} else {
				res.json({ status: 'err', err: '¡Ups! El nombre de usuario o correo que ingresaste ya está registrado.', posibleUser });
				return;
			}
		} else {
			res.json({ status: 'err', err: '¡Ups! Por favor, revisa tu contraseña.' });
			return;
		}
	} else {
		res.json({ status: 'err', err: '¡Ups! Por favor, ingresa todos los datos.' });
		return;
	}
});

//para el azure
const port=process.env.PORT || 3000

app.listen(port);