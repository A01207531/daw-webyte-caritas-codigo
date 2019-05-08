const f = require('express').Router();
const db = require('../models');
const uuidv4 = require('uuid/v4');
const to = require('../util/to');
const bcrypt = require('bcryptjs');

//En go seria data, err := db.Query("SELECT ...")

f.get('/',(req,res) => {
    if(req.session.userID){
        res.redirect('/dashboard');
        return;
    }

    res.render('recuperar-contrasena/mail');
});

f.post('/',async (req,res) => {
    const username = req.body.email;

    const q = await db.query('SELECT id,nombre,email,login FROM usuario WHERE login=$1 OR email=$1',[username]);
    console.log(q);

	if(!q || q.rowCount != 1){
		res.render('recuperar-contrasena/mail',{
			error: "El usuario introducido no existe"
		});
		return;
    }
    
    const user = q.rows[0];

    const token = uuidv4();

    db.query("INSERT into forget_pass (token, user_id) VALUES ($1,$2)",[token,user.id],(err,resq) => {
        if(err){
            console.log(err);
            res.end("error 500");
        }else{
            //no error, send via EMAIL
            console.log("Hola, tu código de recuperación es "+token);
            res.redirect('/forgot/token');
        }
    })

    
});

f.get('/token',(req,res) => {
    res.render('recuperar-contrasena/token')
});

f.post('/token',async (req,res) => {

    console.log(req.body);
    const token = req.body.token;

    //The expiration of the token is 8 hours
    const query = "SELECT user_id FROM forget_pass WHERE token=$1";

    const q = (await to(db.query(query,[token])))[1]; //Por que Topi, por que ...

    console.log(q);

    if(!q || q.rowCount != 1){
		res.render('recuperar-contrasena/token',{
			error: "El código de recuperación no existe o ya ha expirado"
		});
		return;
    }

    //it exists.
    const pass1 = req.body.pass1;
    const pass2 = req.body.pass2;

    const id = q.rows[0].user_id;

    if(pass1 != pass2){
        res.render('recuperar-contrasena/token',{
			error: "Las contraseñas no coinciden"
		});
		return;
    }

    const salt = bcrypt.genSaltSync(8);
    console.log(pass1);
    const newHash = bcrypt.hashSync(pass1, salt);
    
    db.query("UPDATE usuario SET passhash='"+newHash+"' WHERE id="+id,(err,resq) => {
        if(err){
            console.log(err);
            res.end("error 500");
        }else{
            res.end('Se ha recuperado la contraseña')
        }
    })
})

module.exports = f;