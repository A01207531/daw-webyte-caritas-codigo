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

app.get('/', async (req, res) => {
  const query = await db.sequelize.query('SELECT * FROM usuario');
  console.log(query);
  // res.render('index/index', {title: "Gola", query});
  res.json(query);
});

const port=process.env.PORT || 3000

app.listen(port);