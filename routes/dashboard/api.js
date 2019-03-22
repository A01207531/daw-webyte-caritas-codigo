const db = require('../../models');
const r = require('express').Router();

r.get('/municipios', async (req,res) => {
    //may the client group them
    const citiQ = await db.query("SELECT * FROM municipio");
    res.json(citiQ.rows);
});


module.exports = r;