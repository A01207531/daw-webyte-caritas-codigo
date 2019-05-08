const db = require('../../models');

const benef = require('express').Router();
const CONSTANTS = require('../../constants/rbac');
benef.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
    }
     if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
		
    //Ask the beneficiaries to the db
    const bq = await db.query('SELECT nombre,apellido,curp,sexo,nacimiento,id FROM beneficiario');

    //res.json(bq.rows);
	
	res.render('dashboard/beneficiarios/list',{
		layout: 'dashboard-base',
        user: req.session.user,
        benef: bq.rows
	});
}else{
	  res.redirect('/dashboard');
	  return;
	  }
});
	benef.get('/', async (req, res) => {
		if(!req.session.userID){
			    res.redirect("/login");
			    return;
			  }
			  if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
			
			

		res.render('beneficiario/index', {

		});
	}else{
		  res.redirect('/dashboard');
		  return;
		  }
	});
	
benef.get('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
	
	const pq = await db.query('SELECT * FROM canalizacion ', );
	const bq = await db.query('SELECT * FROM proyecto ', );

	res.render('dashboard/beneficiarios/create',{
		layout: 'dashboard-base',bene:pq.rows, proj:bq.rows
	});
}else{
	  res.redirect('/dashboard');
	  return;
	  }
});

benef.post('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
		let { calle, numero, cp, colonia, profesion, name, lastname, curp, sexo, nacimiento, city, canalizacion, rfc, estadoCivil, zona, checkIndigena, checkExtrangero } = req.body;
	
	
		checkIndigena = !!checkIndigena;
		checkExtrangero = !!checkExtrangero;

		const params = [name,lastname,curp,sexo,nacimiento,city,canalizacion,rfc,estadoCivil,zona,checkExtrangero,checkIndigena,profesion,calle,numero,cp,colonia];
		// console.table(params);
		// res.json({params});

		// console.log(req.body.proyectos);
		
		// console.log(...params);
		const query = 'INSERT INTO beneficiario(ID,nombre,apellido,curp,sexo,nacimiento,municipio_id,canalizacion_id,rfc,estadocivil,zonageografica,extranjero,indigente,profesion,calle,numero,cp,colonia) VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)';

		db.query(query,params, async (err, resp) => {
			if(err) {
				console.log(err.stack);
				//Este error viene de la BD, por lo que solo puede ser por la
				//violación de la llave única. 
				res.render('dashboard/errors/generic',{
					layout: 'dashboard-base',
					user: req.session.user,
					title: 'Error al ingresar los datos',
					text: 'Ocurrio un error al insertar los datos'
				});
			} else {
				console.log(resp);

				let idBenef = await db.query('SELECT id FROM beneficiario WHERE curp=$1', [curp]);
				idBenef = idBenef.rows[0].id;
				console.log("IDBenef:",idBenef);
				req.body.proyectos.forEach(id => {
					db.query('INSERT INTO proyecto_beneficiario(proyecto_id, beneficiario_id) VALUES($1, $2)', [parseInt(id), parseInt(idBenef)]);
					// console.log(id);
				});

				res.render('dashboard/beneficiarios/modificado',{
					layout: 'dashboard-base',
					user: req.session.user,
				});
			}
		})
	}else{
	  res.redirect('/dashboard');
	  return;
  }
});


benef.get('/modificar/:id', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
  let beneficiario = await db.query('SELECT * FROM beneficiario WHERE id=$1', [req.params.id]);
			beneficiario=beneficiario.rows[0];
			const pq = await db.query('SELECT * FROM canalizacion ', );
		res.render('dashboard/beneficiarios/modificar', { ...beneficiario, session: req.session 
			,layout: 'dashboard-base',
			user: req.session.user,bene:pq.rows});
		//res.json({canalizacion})
	}else{
		  res.redirect('/dashboard');
		  return;
		  }
});

benef.get('/:id', async (req, res) => {
	if(!req.session.userID){
		    res.redirect("/login");
		    return;
		  }
		  if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
		
		
  let beneficiario = await db.query('SELECT * FROM beneficiario WHERE id=$1', [req.params.id]);
  beneficiario = beneficiario.rows[0];
  // console.log(beneficiario)
  res.render('dashboard/beneficiarios/detail', { beneficiario, session: req.session,layout:"dashboard-base",user: req.session.user });
	}else{
	  res.redirect('/dashboard');
  	return;
  }
});

//--Edit
benef.get('/json/:id',async (req,res) => {

	if(!req.session.userID){
		    res.redirect("/login");
		    return;
		  }
		  if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
		
		

	let beneficiario = await db.query('SELECT * FROM beneficiario WHERE id=$1', [req.params.id]);
  if(beneficiario.rowCount>0) {
    beneficiario = beneficiario.rows[0];
  
    let [ municipio ] = await Promise.all([
       
      db.query('SELECT * FROM municipio WHERE id=$1', [beneficiario.municipio_id]),
      
    ]);
    beneficiario.municipio = municipio.rows[0];
    
    // console.log("Donadores: ", totalDonadores, "Donaciones: ", totalDonaciones)
    res.json(beneficiario);
  } else {
    res.render('404', { status:'err', err:'No se pudo encontrar el beneficiario solicitado', session: req.session });
	}
}else{
	  res.redirect('/dashboard');
	  return;
	  }
})

benef.post('/modificar/:id', (req,res) => {

	if(!req.session.userID){
		    res.redirect("/login");
		    return;
		  }
		  if(req.session.user.privileges.includes(CONSTANTS.CREATE_PROJECT)) {
		
		

	const name = req.body.name;
	const lastname = req.body.lastname;
	let checkIndigena = req.body.checkIndigena;
	let checkExtrangero = req.body.checkExtrangero;
	const state = req.body.state;
	const city = req.body.city;
	const nacimiento = req.body.nacimiento;
	const address = req.body.address;
	const curp = req.body.curp;
	const rfc = req.body.rfc;
	const profesion = req.body.profesion;
	const status = req.body.status;
	const estadoCivil = req.body.estadoCivil;
	const canalizacion = req.body.canalizacion;
	if (checkIndigena==null) {
		checkIndigena=false;
	}
	if (checkExtrangero==null) {
		checkExtrangero=false;
	}
	
	const params = [name,lastname,checkIndigena,checkExtrangero,nacimiento,address,curp,rfc,profesion,status,estadoCivil,canalizacion,req.params.id];
	console.log(...params);
	const query = 'UPDATE beneficiario SET nombre=$1,apellido=$2,indigente=$3,extranjero=$4,nacimiento=$5,direccion=$6,curp=$7,rfc=$8,profesion=$9,sexo=$10,estadocivil=$11,canalizacion_id=$12 WHERE id=$13';


	db.query(query,params, (err, resp) => {
		if(err){
			console.log(err.stack);
		  //Este error viene de la BD, por lo que solo puede ser por la
		  //violación de la llave única. 
		  res.render('dashboard/errors/generic',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'Ocurrio un error al insertar los datos'
		  });
		}else{
			res.render('dashboard/beneficiarios/modificado',{
				layout: 'dashboard-base',
				user: req.session.user,
				})
		}
	})
}else{
	  res.redirect('/dashboard');
	  return;
	  }
})

module.exports = benef;