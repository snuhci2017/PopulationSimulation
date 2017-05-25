(function() {

    window.onload = initialize;
    window.onresize = initialize;

    function initialize() {
        load_population(true);
    }
    //TODO: factor csv loading into other file
    d3.csv('factor.csv', (error,data) => {
        if (error) {
            alert("csv import error");
            console.log(error);
            return;
        }
        const factorData = data.map((row) => {
            let json = {};
            for (var key in row) {
                json[key] = Number(row[key]);
            }
            return json;
        })
        draw_factor(factorData);
    });

})();;
