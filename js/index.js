(function() {

    $(initialize);

    function initialize() {
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
        d3.csv('population.csv', (error, data) => {
            if (error) {
                alert("csv import error");
                console.log(error);
                return;
            }
            let populationData = {};
            const yearStrings = data.map((d) => d.year).filter((d) => d.endsWith('_total')).map((d) => d.slice(0,-6));
            console.log(yearStrings);
            yearStrings.forEach((year) => {
                populationData[year] = {};
            });
            console.log(populationData);
            data.forEach((row) => {
                const year = row.year.slice(0,4);
                const type = row.year.slice(5);
                let rowJson = {}
                let totalForRow = 0;
                for (var key in row) {
                    if (key === 'year') continue;
                    let number = Number(row[key]);
                    rowJson[key] = number;
                    totalForRow  = totalForRow + number;
                }
                populationData[year][type] = rowJson;
                populationData[year][type]['total'] = totalForRow;
            });
            draw_population();
        });
    }
})();;
