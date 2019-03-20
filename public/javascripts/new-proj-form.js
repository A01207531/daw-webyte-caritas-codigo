
$('select').formSelect();

//Thank you JamieMason
    // https://gist.github.com/JamieMason/0566f8412af9fe6a1d470aa1e089a752
    const groupBy = key => array =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
      }, {});

      const groupByState = groupBy('estado');

    //Get all the cities in mexico in hierachy
    let mx = {}; 
    $.ajax({
        url: '/dashboard/api/municipios',
        success: result => {
            console.log(result);
            mx = groupByState(result);
        },
    });

    //Get all the sub programs in double hierarchy
    //later for now make the form dynamic