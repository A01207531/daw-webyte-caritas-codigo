
$('select').formSelect();

let las = {
    "ASISTENCIA SOCIAL": [],
    "DESARROLLO HUMANO": [],
    "SUSTENTABILIDAD AMBIENTAL": [],
    "CANALIZACIONES": []
}

$.getJSON("/dashboard/proyectos/programAPI", data => {
    for(const i in data){
        const sub = data[i];
        const la = sub.lineadeaccion;
        const prog = sub.prog;
        if(!(prog in las[la])){
            //this is a new program
            las[la][prog] = [];
        }

        las[la][prog].push(sub);

    }
});

$('#state').change(e => {
    //get the cities
    const cities = mx[$('#state').val()];
    //we have the cities
    //clear the select
    $('#city').empty();
    //populate the cities
    for(const c in cities){
        const city = cities[c];
        $('#city').append('<option value="'+city.id+'">'+city.nombre+'</option>');
    }

})

