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

function savePostInDB(title,content,img,req,res){
	const query = 'INSERT INTO posts(titulo,cuerpo,fotourl,autor) VALUES ($1,$2,$3,$4)';
	const values = [title,content,"https://caritasqro.blob.core.windows.net/uploads/"+img,req.session.userID];

	db.query(query,values, (err, resp) => {
		if(err){
			console.log(err.stack);
		  //Este error viene de la BD, por lo que solo puede ser por la
		  //violación de la llave única. 
		  res.render('dashboard/errors/generic',{
			  layout: 'dashboard-base',
			  user: req.session.user,
			  title: 'Error al ingresar los datos',
			  text: 'Ocurrio un error al insertar la imagen'
		  });
		}else{
			res.render('dashboard/canalizaciones/success',{
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

	const query = 'INSERT INTO proyecto(id,nombre,descripcion,inicio,final,estatus,responsable,observaciones,subprograma_id,municipio_id,direccion,solicitado) VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';

	const p = req.body; //p de post

	const sol = p.solicitado;

	const responsable = req.session.userID;

	const values = [p.name,p.desc,p.inicio,p.final,p.status,responsable,p.observation,p.sub,p.city,p.address,sol];
	console.log(p)
	//res.json(p);

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
			savePostInDB(title,content,blobName,req,res);
	});

	
});

pr.get('/editar/:projectid', async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	
	res.send("Aqui es para editar el proyecto " + req.params.projectid);
});


pr.get('/programAPI',async (req, res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}

	const q = await db.query("SELECT * FROM resumen_programas");

	res.json(q.rows);
})

module.exports = pr;