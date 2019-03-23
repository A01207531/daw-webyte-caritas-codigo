
$('select').formSelect();


const first = mx[$('#state').val()];

for(const c in first){
    const city = first[c];
    $('#city').append('<option value="'+city.id+'">'+city.nombre+'</option>');
}

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