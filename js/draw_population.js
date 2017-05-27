

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
    function color_function(d) {
        return color_dic[d[2]];
    }
    init_code_hierarchy_plot(year2data(year), year, id, numChart, color_function, label_function, legend_function);
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