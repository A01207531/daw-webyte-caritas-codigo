const db = require('../../models');
const pr = require('express').Router();

//Azure blob storage
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
uploadStrategy = multer({ storage: inMemoryStorage }).single('upload');
const azureStorage = require('azure-storage');
const blobService = azureStorage.createBlobService();
const getStream = require('into-stream');
const containerName = 'uploads';

const getBlobName = originalName => {
	const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
	return `${identifier}-${originalName}`;
};

pr.get('/', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	//Ask the projects to the db
	const pq = await db.query('SELECT nombre,descripcion,inicio,final,estatus,id FROM proyecto');
	
	console.log(pq);

	res.render('dashboard/proyectos/list',{
		layout: 'dashboard-base',
		user: req.session.user,
		proj: pq.rows
	})
});

pr.get('/nuevo', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	res.render('dashboard/proyectos/create',{
		layout: 'dashboard-base',
		user: req.session.user,
	})
});

function progCat(prog,cat){
	console.log("Asociando el programa con id " + prog + " con " + cat);
}

const handleError = (err, res) => {
	res.status(500);
	res.render('error', { error: err });
};

function savePostInDB(img,req,res){
	const query = 'INSERT INTO proyecto(id,nombre,descripcion,inicio,final,estatus,responsable,observaciones,subprograma_id,municipio_id,direccion,solicitado,img) VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)';

	const p = req.body; //p de post

	const sol = p.solicitado;

	const responsable = req.session.userID;

	const values = [p.name,p.desc,p.inicio,p.final,p.status,responsable,p.observation,p.sub,p.city,p.address,sol,"https://caritasqro.blob.core.windows.net/uploads/"+img];

	//res.json(p);

	db.query(query, values, (err, resp) => {
		if (err) {
		  console.log(err.stack);
		  //Este error viene de la BD, por lo que solo puede ser por la
		  //violación de la llave única. 
		  res.render('dashboard/errors/generic',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'El error se debe a que los datos no son validos. Es posible que el nombre del proyecto ya exista.'
		  });
		} else {
		  res.render('dashboard/proyectos/success',{
			layout: 'dashboard-base',
			user: req.session.user,
		  })
		}
})
}

pr.post('/nuevo', uploadStrategy,(req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	//azure stuff
	const
          blobName = getBlobName(req.file.originalname)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
		;
		
		blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {

			if(err) {
					handleError(err);
					return;
			}

			//we did it. Now store the rest of the data in the DB
			savePostInDB(blobName,req,res);
	});

	
});

pr.get('/editar/:id', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	
	let proyecto = await db.query('SELECT * FROM proyecto WHERE id=$1', [req.params.id]);
  if(proyecto.rowCount>0) {
    proyecto = proyecto.rows[0];
  
    let [ subPrograma, municipio, totalDonadores, totalDonaciones ] = await Promise.all([
      db.query('SELECT * FROM subprograma WHERE id=$1', [proyecto.subprograma_id]), 
      db.query('SELECT * FROM municipio WHERE id=$1', [proyecto.municipio_id]),
      db.query('SELECT COUNT(nombre) FROM donasporpersona'),
      db.query('SELECT SUM(monto) FROM dona WHERE proyecto_id=$1', [req.params.id])
    ]);
    proyecto.municipio = municipio.rows[0];
    // subPrograma = subPrograma.rows[0];
    let programa = await db.query('SELECT * FROM programa WHERE id=$1', [subPrograma.rows[0].programa_id]);
    proyecto.programa = programa.rows[0];
    proyecto.programa.subPrograma = subPrograma.rows[0];
    
    let paypal_string = process.env.paypal_string;
    totalDonadores = totalDonadores.rows[0].count;
    totalDonaciones = totalDonaciones.rows[0].sum;

    // console.log("Donadores: ", totalDonadores, "Donaciones: ", totalDonaciones)
    res.render(
      'dashboard/proyectos/edit', 
      { 
				layout: 'dashboard-base',
        status:'ok', 
        proyecto, 
        session: req.session,});
  } else {
    res.render('404', { status:'err', err:'No se pudo encontrar el proyecto solicitado', session: req.session });
  }
});


pr.get('/programAPI',async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	const q = await db.query("SELECT * FROM resumen_programas");

	res.json(q.rows);
})

//--Edit
pr.get('/json/:id',async (req,res) => {
	let proyecto = await db.query('SELECT * FROM proyecto WHERE id=$1', [req.params.id]);
  if(proyecto.rowCount>0) {
    proyecto = proyecto.rows[0];
  
    let [ subPrograma, municipio, totalDonadores, totalDonaciones ] = await Promise.all([
      db.query('SELECT * FROM subprograma WHERE id=$1', [proyecto.subprograma_id]), 
      db.query('SELECT * FROM municipio WHERE id=$1', [proyecto.municipio_id]),
      db.query('SELECT COUNT(nombre) FROM donasporpersona'),
      db.query('SELECT SUM(monto) FROM dona WHERE proyecto_id=$1', [req.params.id])
    ]);
    proyecto.municipio = municipio.rows[0];
    // subPrograma = subPrograma.rows[0];
    let programa = await db.query('SELECT * FROM programa WHERE id=$1', [subPrograma.rows[0].programa_id]);
    proyecto.programa = programa.rows[0];
    proyecto.programa.subPrograma = subPrograma.rows[0];
    
    let paypal_string = process.env.paypal_string;
    totalDonadores = totalDonadores.rows[0].count;
    totalDonaciones = totalDonaciones.rows[0].sum;

    // console.log("Donadores: ", totalDonadores, "Donaciones: ", totalDonaciones)
    res.json(proyecto);
  } else {
    res.render('404', { status:'err', err:'No se pudo encontrar el proyecto solicitado', session: req.session });
  }
})

function updateWithoutImg(p,id,res,session){
	const query = 'UPDATE proyecto SET nombre=$1,descripcion=$2,inicio=$3,final=$4,estatus=$5,observaciones=$6,subprograma_id=$7,municipio_id=$8,direccion=$9,solicitado=$10 WHERE id=$11';

	const values = [p.name,p.desc,p.inicio,p.final,p.status,p.observation,p.sub,p.city,p.address,p.solicitado,id];

	db.query(query,values, (err, resp) => {
		if(err){
			console.log(err.stack);
		  //Este error viene de la BD, por lo que solo puede ser por la
		  //violación de la llave única. 
		  res.render('dashboard/errors/generic',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'Ocurrio un error'
		  });
		}else{
			res.render('dashboard/canalizaciones/success',{
				layout: 'dashboard-base',
				user: session.user,
			})
		}
	})
}

pr.post('/editar/:id',uploadStrategy,(req,res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	const project = req.body;
	const session = req.session;

	if(req.file){
		//do azure stuff here
		//azure stuff
		const
		blobName = getBlobName(req.file.originalname)
	, stream = getStream(req.file.buffer)
	, streamLength = req.file.buffer.length
	;

	blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {

		if(err) {
			handleError(err);
			return;
		}

		//we did it. Now store the rest of the data in the DB
		//savePostInDB(title,content,blobName,req,res);
		updateWithImg(title,content,req,res,req.params.id,"https://caritasqro.blob.core.windows.net/uploads/"+blobName);
	});
	}else {
		//Execute a simple update
		//updateWithoutImg(title,content,req,res,req.params.id);
		updateWithoutImg(project,req.params.id,res,session);
	}

})

module.exports = pr;