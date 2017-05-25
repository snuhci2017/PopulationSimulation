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

var firstyear = 1970;
var secondyear = 2010;

function draw_population() {
    _draw_population('first', firstyear);
    //draw_ringchart('second', secondyear);

}

document.addEventListener("time_changed", function(e){
    var _year = e.detail.year, _id = e.detail.id;
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


