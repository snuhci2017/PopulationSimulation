var populationData = {};
var relationData = {};
var year2data_dic = {};
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
            var year = row.year.slice(0, 4);
            var type = row.year.slice(5);
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
            update_relation(1915, curryear);
            for (var year = startyear; year<=curryear; year+=5) {
                year2data_dic[year] = _year2data(year);
            }
            loadFactor();
            load = true;

            if (draw) draw_population();
        });

    });
}

function set_simulation_data(f1, f2, f3, f4) {

    var ages = ['0f', '5f', '10f', '15f', '20f', '25f', '30f', '35f', '40f', '45f', '50f', '55f', '60f', '65f', '70ormore'];
    // set simulated value from curryear+5 to endyear
    var get_birthrate = function(v1, v2, v3, v4){
        //// this coefs are from simulation
        value = 113 - (v1+v2+v3+v4)*0.4;
        return value;
    };
    var simulate = function (year) {
        var get_factor_value = function(f){
            return f['a'] * year + f['b']
        };
        return get_birthrate(get_factor_value(f1), get_factor_value(f2), get_factor_value(f3), get_factor_value(f4));
    };
    for (var year = curryear+5; year<=endyear; year+=5) {
        var babynum = 0;
        populationData[year] = {'total':{'0f':0}, 'female':{}};
        // set population value from previous year
        for (var i=1; i<ages.length; i++) {
            if (i===ages.length-1)
                populationData[year]['total'][ages[i]] = (populationData[year-5]['total'][ages[i]] + populationData[year-5]['total'][ages[i-1]])/2;
            else
                populationData[year]['total'][ages[i]] = populationData[year-5]['total'][ages[i-1]];
        }
        for (var i=0; i<ages.length; i++) {
            populationData[year]['female'][ages[i]] = populationData[year]['total'][ages[i]]/2;
        }
        // now calculate number of babies from birth rate and number of women between 15 and 49
        var br = 0, women = 0, prev_women = 0;
        for (var y = year-4; y <= year; y++) {
            br += simulate(y);
        }
        for (var i=4; i<=9; i++) {
            prev_women += populationData[year]['female'][ages[i]];
        }
        women = prev_women + populationData[year]['female'][ages[3]];
        prev_women += populationData[year]['female'][ages[10]];
        babynum = br * women / 1000;
        populationData[year]['total']['0f'] = babynum;

        var prev_factor = populationData[year-5]['total']['0f']/prev_women,
            curr_factor = populationData[year]['total']['0f']/women;
        populationData[year]['childrate'] = populationData[year-5]['childrate']*curr_factor/prev_factor;

    }
    update_relation(curryear+5, endyear);
    for (var year = curryear+5; year<=endyear; year+=5) {
        year2data_dic[year] = _year2data(year);
    }
    draw_population();
}

function update_relation(sy, ey) {

    // this distribution is that of 2015.
    // we assume that birthrate distribution in the future is same as that of 2015.
    var babydist = {15:0.00087, 20:0.03344, 25:0.19402, 30:0.47128, 35:0.239, 40:0.05277, 45:0.00566};

    for (var year=sy; year<=ey; year+=5) {
        if (!(year in relationData))
            relationData[year] = {'parent':{}, 'baby':{}};
        var babynum = (year in populationData)? populationData[year]['total']['0f'] : populationData[1925]['total']['0f'];
        for (var age = 15; age < 45; age += 5){
            if (!(year-age in relationData)) relationData[year-age] = {'baby':{},'parent':{}};
            if (!(year in relationData[year-age]['baby'])) {
                relationData[year]['parent'][year-age] = babynum*babydist[age];
                relationData[year-age]['baby'][year] = babynum * babydist[age];
            }
            if (!(year-age in relationData[year]['parent'])) {
                relationData[year]['parent'][year-age] = babynum*babydist[age];
                relationData[year-age]['baby'][year] = babynum*babudist[age];
            }
        }
    }
}

function year2data(year){
    return year2data_dic[year];
}

function _year2data(year){
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
        _data[age] = {'num': raw_data[age]/1000000,
          'ecorate': 0,
          'childrate': 0,
          'parent': {},
          'baby': {}
        };
        var babynum = 0;
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
        if (year <= curryear) {
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
        } else {
            _data[age]['childrate'] = populationData[year]['childrate'];
        }
    }

    var active = 0, nonactive = 0;
    var old_ages = ['65f', '70ormore'], young_ages = ['0f', '5f', '10f'], sum = 0, sum_of_childrate = 0;
    for (age in _data) {
        if (old_ages.indexOf(age) > -1)
            nonactive += _data[age]['num'];
        else if (young_ages.indexOf(age) == -1)
            active += _data[age]['num'];
        sum_of_childrate += _data[age]['num'] * _data[age]['childrate'];
        sum += _data[age]['num'];
    }
    for (age in _data) {
        _data[age]['ecorate'] = nonactive * 100 / active;
        _data[age]['childrate'] = sum_of_childrate/sum;
    }
    populationData[year]['childrate'] = sum_of_childrate/sum;

    return _data;
}



