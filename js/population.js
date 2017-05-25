var numChart = 1;

/* event
 *   - time_changed: {'id':string, 'year':number}
 *
 * functions
 *    - draw_population: first draw (currently draw two charts)
 *    - add_population: one chart -> two charts
 *      :param year:
 *    - delete_population: two charts -> one chart
 *    - draw_ringchart: setting done but only change chart
 *      :param id:
 *      :param year:
 *
 * */

var firstyear = 1990;
var secondyear = 2010;

function draw_population() {
    setNumChart(2);
    _draw_population('first', firstyear);
    draw_ringchart('second', secondyear);
}

document.addEventListener("time_changed", function(e){
    var _year = e.year, _id = e.id;
    if (_id === 'center') {
        if (numChart === 1) {
            draw_ringchart('first', _year);
        } else {
            setNumChart(1);
            _draw_population('first', _year);
        }
        firstyear = _year;
    } else {
        if (numChart === 2) {
            if (_id === 'left') {
                draw_ringchart('first', _year);
                firstyear = _year;
            } else {
                draw_ringchart('second', _year);
                secondyear = _year;
            }
        } else {
            setNumChart(2);
            if (_id === 'left') {
                _draw_population('first', _year);
                draw_ringchart('second', firstyear);
                secondyear = firstyear;
                firstyear = _year;
            } else {
                _draw_population('first', firstyear);
                draw_ringchart('second', _year);
                secondyear = _year;
            }
        }
    }
});

function setNumChart(_numChart) {

    if (numChart === 1 && _numChart === 2) {
        var _svg = document.createElement('svg');
        _svg.id = 'second';
        _svg.classList.add('ring-chart');
        var svg = document.getElementById('first');
        //comment should be removed after fixing g problem
        //svg.parentNode.insertBefore(_svg, svg.nextSibling);
        var _currs = document.getElementsByClassName('curr');
        var currs = [];
        for (var i=0; i<_currs.length; i++) {
            currs.push(_currs[i]);
        }
        for (var i=0; i<currs.length; i++) {
            currs[i].classList.remove('curr');
            currs[i].classList.add('tot');
            currs[i].classList.add('second');
        }
    }
    else if (numChart === 2 && _numChart === 1) {
        //comment should be removed after fixing g problem
        //document.getElementById('second').remove();
        var _ts = document.getElementsByClassName('tot second');
        var ts = [];
        for (var i=0; i<_ts.length; i++) {
            ts.push(_ts[i]);
        }
        for (var i=0; i<ts.length; i++) {
            ts[i].classList.add('curr');
            ts[i].classList.remove('tot');
            ts[i].classList.remove('second');
        }
    }

    numChart = _numChart;
}


function draw_ringchart(id, year) {
    function count_function(d) {
        return d[1][0];
    }
    function label_function(d) {
        return d[4]['num'];
    }
    function legend_function(type, d) {
        var name;
        if (type === 'num') name = 'population';
        else if (type === 'ecorate') name = 'aged dependency ratio';
        else if (type === 'childrate') name = 'number of children per a family';
        var value = d[4][type];
        if (type!=='num') value = value.toFixed(2);
        var description = description = (d[2]=='')? 'Total ' + name : name + ' of ' + d[2];
        return description + " is <br /><span>" + value + "</span>";
    }
    var color = d3.scale.category20c();
    function color_function(d) { return color(d[2]);}
    init_code_hierarchy_plot(year2data(year), id, numChart, count_function, color_function, label_function, legend_function);
}

function _draw_population(_id, _year){

    var imgurl = {
        'number': 'assets/population.png',
        'work': 'assets/old.png',
        'children': 'assets/children2.png'
    };

    function adjust_display() {
        var width = window.innerWidth;
        var margin, side_flex;
        if (width < 600) {
            margin = (numChart===2)? 0:20;
            side_flex = (numChart===2)? 0.4:0.6;
        } else if (width < 1100) {
            margin = (numChart===2)? 5:50;
            side_flex = (numChart===2)? 0.5:0.8;
        } else if (width < 1600) {
            margin = (numChart===2)? 10:130;
            side_flex = (numChart===2)? 1:1.2;
        } else {
            margin = (numChart===2)? 50:160;
            side_flex = 1.5;
        }
        var side = document.getElementsByClassName('side');
        for (var i=0; i<2; i++) {
            side[i].style.marginLeft = margin + 'px';
            side[i].style.marginRight = margin + 'px';
            side[i].style.flex = side_flex;
        }
        if (numChart == 1) return;
        var chart = document.getElementsByClassName('ring-chart');
        for (var i=0; i<chart.length; i++) {
            chart[i].style.marginLeft = '10px';
            chart[i].style.marginRight = '10px';
        }
    }

    function draw_side(keyword) {

        $divs = $('.' + keyword);
        $divs.html('');
        for (var i=0; i<$divs.length; i++) {
            var img = document.createElement('img');
            img.src = imgurl[keyword];
            img.alt = "number-icon";
            $divs[i].append(img);
            $divs[i].append(document.createElement('p'));
        }
    }

    adjust_display();
    draw_side('number');
    draw_side('work');
    draw_side('children');
    draw_ringchart(_id, _year);
}
