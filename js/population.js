var numChart = 1;

/* event
 *   - time_changed: {'id':string, 'year':number}
 *   - factor_changed: {'factor1' : {'a': int, 'b': int}, ... }
 *
 * */

var firstyear = inityear;
var secondyear = curryear;


function draw_population() {
    set_display();
    draw_ringchart('first', firstyear);
    if (numChart === 2) draw_ringchart('second', secondyear);
}

document.addEventListener("time_changed", function(e){
    var _year = e.detail.year, _id = e.detail.id;
    if (_id === 'center') {
        if (numChart !== 1) {
            setNumChart(1);
            set_display();
        }
        draw_ringchart('first', _year);
        firstyear = _year;
    } else {
        if (numChart === 2) {
            if (_id === 'left') {
                firstyear = _year;
            } else {
                secondyear = _year;
            }
        } else {
            setNumChart(2);
            set_display()
            if (_id === 'left') {
                secondyear = firstyear;
                firstyear = _year;
            } else {
                secondyear = _year;
            }
        }
        draw_ringchart('first', firstyear);
        draw_ringchart('second', secondyear);
    }
});

document.addEventListener("factor_changed", function(e){
    var f1 = e.detail['marriage age'],
        f2 = e.detail['education rate'],
        f3 = e.detail['housing price'],
        f4 = e.detail['female economic rate'];
    set_simulation_data(f1, f2, f3, f4);
});

function setNumChart(_numChart) {

    if (numChart === 1 && _numChart === 2) {
        $('svg#second').show();
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
        $('svg#second').hide();
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


