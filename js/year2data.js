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

function load_population(draw = false) {
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
            if (draw) draw_population();
        });

    });
}

function set_simulate_data(f1, f2, f3, f4) {
    var ages = ['0f', '5f', '10f', '15f', '20f', '25f', '30f', '35f', '40f', '45f', '50f', '55f', '60f', '65f', '70ormore'];
    // set simulated value from curryear+5 to endyear
    var get_birthrate = function(v1, v2, v3, v4){
        var coef0 = [-5.1093, 0.1305, 0.0083, 0.0103, 0.0101];
        var coef1 = [-0.0265, 0.0472, -0.0168, 0.0609, 0.1934, -0.1046];
        var coef2 = [-2.3166, -0.0185, -0.0909, -0.2672];
        var value = 0;
        value += coef0[0] + coef0[1]*v1 coef0[2]*v2 coef0[3]*v3 coef0[4]*v4;
        value += coef1[0]*v1*v2 + coef1[1]*v1*v3 + coef1[2]*v1*v4 + coef1[3]*v2*v3 + coef1[4]*v2*v4 + coef1[5]*v3*v4;
        value += coef2[0]*v1*v1 + coef2[1]*v2*v2 + coef2[2]*v3*v3 + coef2[3]*v4*v4;
        return value;
    };
    var simulate(year) {
        var get_factor_value = function(f){
            return f['a'] * year + f['b']
        };
        var birthrate = get_birthrate(get_factor_value(f1), get_factor_value(f2), get_factor_value(f3), get_factor_value(f4));
        var women_d = populationData[year]['female'];
        var women = 0;
        for (var i=3; i<=9; i++) {
            women += women_d[ages[i]];
        } //age of 15-49
        console.log(year, birthrate, women); // for debug
        return birthrate * women / 1000;
    };
    for (var year = curryear+5; year<=endyear; year+=5) {
        var babynum = 0;
        for (var y = year-4; y <= year; y++) {
            babynum += simulate(y);
        }
        populationData[year]['total']['0f'] = babynum;
        for (var i=1; i<ages.length; i++) {
            populationData[year]['total'][ages[i]] = populationData[year-5]['total'][ages[i-1]];
        }
        for (var i=0; i<ages.length; i++) {
            populationData[year]['female'][ages[i]] = populationData[year]['total'][ages[i]]/2;
        }
    }
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
          'ecorate': 0,
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

    var active = 0, nonactive = 0;
    var old_ages = ['65f', '70ormore'], young_ages = ['0f', '5f', '10f'];
    for (age in _data) {
        if (old_ages.indexOf(age) > -1) nonactive += _data[age]['num'];
        else if (young_ages.indexOf(age) == -1) active += _data[age]['num'];
    }
    for (age in _data) {
        _data[age]['ecorate'] = nonactive * 100 / active;
    }

    return _data;

}





