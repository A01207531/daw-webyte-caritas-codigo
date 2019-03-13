const Sequelize = require('sequelize');
let sequelize = null;

sequelize = new Sequelize({
  dialect: 'postgres',
  database: process.env.dbname,
  username: process.env.user,
  host: process.env.host,
  port: process.env.portDB,
  password: process.env.password,
  dialectOptions: {
    ssl: true
  }
});

global.db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
};

module.exports = global.db;