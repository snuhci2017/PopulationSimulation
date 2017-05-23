var populationData = {};
var load = false
function load_population() {
    // this is dummy data
    if (load) {
        draw_population();
        return;
    }
    d3.csv('data/population.csv', (error, data) => {
        if (error) {
            alert("csv import error");
            console.log(error);
            return;
        }
        console.log(data);
        const yearStrings = data.map((d) => d.year).filter(
            (d) => d.endsWith('_total')
          ).map((d) => d.slice(0, -6));
        yearStrings.forEach((year) => {
            populationData[year] = {};
        });
        console.log(yearStrings);
        data.forEach((row) => {
            const year = row.year.slice(0, 4);
            const type = row.year.slice(5);
            let rowJson = {};
            let totalForRow = 0;
            for (var key in row) {
              if (key === 'year') continue;
              let number = Number(row[key]);
              rowJson[key] = number;
              totalForRow = totalForRow + number;
            }
            populationData[year][type] = rowJson;
            populationData[year][type]['total'] = totalForRow;

        });
        console.log(populationData);
        load = true;
        draw_population();
    });
}


function year2data(year){
    var raw_data = populationData[year]['total'];
    var data = {};
    for (var age in raw_data) {
        if (age === 'total') continue;
        data[age] = {'num': Math.floor(raw_data[age]/1000), 'ecorate': 1.32, 'childrate': 1.23};
    }
    return data;

}


