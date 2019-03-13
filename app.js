require('dotenv').config();

const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const db = require('./models');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
app.get('/', (req, res) => {
  // const query = await db.sequelize.query('SELECT * FROM usuario');
  // console.log('Hola');
  res.render('index.hbs');
  // res.json(query);
});

app.get('/login', (req,res) => {
  res.render('login.hbs');
});

//para el azure
const port=process.env.PORT || 3000

app.listen(port);