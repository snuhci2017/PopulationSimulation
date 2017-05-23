

function draw_population() {

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
            else if (type === 'ecorate') name = 'labor participation rate';
            else if (type === 'childrate') name = 'number of children per a family';
            var value = d[4][type];
            if (type!=='num') value = value.toFixed(2);
            var description = description = (d[2]=='')? 'Total ' + name : name + ' of ' + d[2];
            return description + " is <br /><span>" + value + "</span>";
        }
        var color = d3.scale.category20c();
        function color_function(d) { return color(d[2]);}
        init_code_hierarchy_plot(year2data(year), id, count_function, color_function, label_function, legend_function);
    }

    var imgurl = {
        'number': 'assets/population.png',
        'work': 'assets/work.png',
        'children': 'assets/children2.png'
    };

    function adjust_display() {
        var width = window.innerWidth;
        var margin, side_flex;
        if (width < 600) {
            margin = '20px';
            side_flex = '0.6';
        } else if (width < 1100) {
            margin = '50px';
            side_flex = '0.8';
        } else if (width < 1600) {
            margin = '130px';
            side_flex = '1.2';
        } else {
            margin = '160px';
            side_flex = '1.5';
        }
        var side = document.getElementsByClassName('side');
        for (var i=0; i<2; i++) {
            side[i].style.marginLeft = margin;
            side[i].style.marginRight = margin;
            side[i].style.flex = side_flex;
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
    draw_ringchart('main', 1980);

}
