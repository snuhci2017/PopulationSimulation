var populationData = {};
var relationData = {};
/*
 *
 * 1960 borned babies's parents are okay
 *
 * 1960 parent's have babies on how to...?
 *    - 1975's 15-19
 *    - 1980's 20-24
 *    - 1985's 25-29
 *    - 1990's 30-34
 *    - 1995's 35-39
 *
 * relation = {
 *    '1960' : {'parents': {'': '': '': }, 'baby': {'': '' :'':}}
 *
 * }
 *
 * */

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
        const yearStrings = data.map((d) => d.year).filter(
            (d) => d.endsWith('_total')
          ).map((d) => d.slice(0, -6));
        yearStrings.forEach((year) => {
            populationData[year] = {};
        });

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
        d3.csv('data/population_baby_number.csv', (error, data) => {
            if (error) {
                alert ('csv import error');
                console.log(error);
                return;
            }
            data.forEach((row) => {
                const year = Number(row['year'].substring(0, 1) + row['year'].substring(2,5));
                relationData[year] = {'parent': {}, 'baby': {}};
                for (var age = 15; age < 50; age += 5) {
                    var babynum = row[age + '-' + (age+4)];
                    if (babynum === '') babynum = 0;
                    else babynum = Number(babynum);
                    relationData[year]['parent'][year-age] = babynum;
                    if (!(year-age in relationData))
                        relationData[year-age] = {'parent':{}, 'baby':{}};
                    relationData[year-age]['baby'][year] = babynum;
                }
            });
            load = true;
            draw_population();
        });

    });
}


function year2data(year){
    var raw_data = populationData[year]['total'];
    var _data = {};

    function birthyear2age(birthyear) {
        var a = year - birthyear;
        if (a < 70 && a>=0) return a + "f";
        if (a == 70) return '70ormore';
        return "";
    }
    function age2birthyear(a) {
        return (a === '70ormore')? year - 70: year - Number(a.substring(0, a.length-1))
    }

    for (var age in raw_data) {
        if (age === 'total') continue;
        var _year = age2birthyear(age);
        if (_year <= 1910) _year = 1915;
        var relation = relationData[_year];
        _data[age] = {'num': Math.floor(raw_data[age]/1000),
          'ecorate': 12.00,
          'childrate': 0,
          'parent': {},
          'baby': {}
        };
        for (by in relation['parent']){
            var _a = birthyear2age(by);
            if (_a === '') continue;
            _data[age]['parent'][_a] = relation['parent'][by];
        }
        for (by in relation['baby']){
            var _a = birthyear2age(by);
            if (_a === '') continue;
            _data[age]['baby'][_a] = relation['baby'][by];
        }
        var babynum = 0;
        // number of babies of this age range

        for (var a = 15; a < 50; a += 5) {
            var yr = age2birthyear(age) + a; // year of birth of baby
            if (yr in relation['baby']) {
                babynum += relation['baby'][yr];
            } else if (yr < 1960) {
                babynum += relation['baby'][1960];
            }
        }
        var female = populationData[year]['female'][age];
        _data[age]['childrate'] = babynum/female;
    }
    return _data;

}






