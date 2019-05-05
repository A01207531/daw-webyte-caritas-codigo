const db = require('../../models');
const r = require('express').Router();

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


//esto deberia listar los posts en una tabla
r.get('/', async (req,res) => {
    if(!req.session.userID){
			res.redirect("/login");
			return;
		}
		
		//En esta hacemos un query sencillo a las canalizaciones
		const cq = await db.query('SELECT id,titulo,fecha FROM posts ORDER BY fecha');

		//console.log(cq.rows);
		
    //Listar los datos obtenidos
    res.render('dashboard/blog/list',{
			layout: 'dashboard-base',
			user: req.session.user,
			posts: cq.rows
        })
})


//Esto es un formulario para crear un nuevo post
r.get('/nuevo', (req,res) => {
	if(!req.session.userID){
		res.redirect("/login");
		return;
	}
	
	res.render('dashboard/blog/create',{
		layout: 'dashboard-base',
		user: req.session.user
	})
})

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

//esto es el endpoint del form
r.post('/nuevo',uploadStrategy,(req,res) => {
	
	//res.json(req.body)
	const title = req.body.titulo;
	const content = req.body.contenido;

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

})

//-----------------Editar POST-----------------------
r.get("/editar/:id",async (req,res) => {
	let post = await db.query('SELECT * FROM posts WHERE id=$1', [req.params.id]);
  if(post.rowCount>0) {
    post = post.rows[0];
    //res.json(proyecto);
  
    res.render('dashboard/blog/edit', { layout: 'dashboard-base',post, session: req.session });
  } else {
    res.render('404', { status:'err', err:'No se pudo encontrar el proyecto solicitado', session: req.session });
  }
})

module.exports = r;