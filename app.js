require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Setup View Engine
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.locals.title = 'Cáritas de Querétaro';

app.get('/', (req, res) => {
  res.send('Bien, bien');
});

const port=process.env.PORT || 3000

app.listen(port);