

function draw_ringchart(id, year) {
    function count_function(d) {
        return d[1][0];
    }
    function label_function(d) {
        return d[4]['num'];
    }
    function legend_function(type, d, title=false) {
        /*
        var name;
        if (type === 'num') name = 'Population';
        else if (type === 'ecorate') name = 'Aged dependency ratio';
        else if (type === 'childrate') name = 'Number of children per a family';
        var value = title? d[type] : d[4][type];
        if (type!=='num') value = value.toFixed(2);
        var description = '<span id="name">' + name + '</span>'
        if (!title) description += ' of ' + name2range(d[2]);
        description += " is <br /><span id='value'>" + value + "</span>";
        if (type === 'num') description += 'K';
        return description;
        */
        var value = title? d[type] : d[4][type];
        value = value.toFixed(2);
        if (type==='num') value = value + 'M';
        var description = "<span id='value'>" + value + "</span>";
        if (!title && type!=='num') {
            if (type === 'ecorate') {
                description = "<span id='purple'>Purple</span><br>children generation";
            } else {
                description = "<span id='blue'>Blue</span><br>parents generation";
            }
        }
        return description;
    }
    function color_function(d) {
        return color_dic[d[2]];
    }
    init_code_hierarchy_plot(year2data(year), year, id, numChart, color_function, label_function, legend_function);
}

function set_display(){

    var imgurl = {
        'number': 'assets/population.png',
        'work': 'assets/old.png',
        'children': 'assets/children2.png'
    };

    function adjust_display() {
        var h = $('#population-container').height(),
            w = $('#population-container').width();
        // wr + 2ws + 4m = w
        var w_ringchart = h*0.9;
        var w_rest = (w-numChart * h)/2, w_side, w_margin;
        if (w_rest < 140) {
            if (w_ringchart * numChart > w-250) w_ringchart = (w-250) / numChart;
            w_side = 100;
            w_margin = 5
        } else if (w_rest > 330) {
            w_side = 280;
            w_margin = (w_rest - w_side)/2;
        } else {
            w_side = 0.85*w_rest;
            w_margin = 0.05*w_rest;
        }

        /*
        $('.ring-chart').width(w_ringchart);
        $('.ring-chart').height(w_ringchart);
        $('.side div').width(w_side);
        $('.side div').css('margin-left', w_margin);
        $('.side div').css('margin-right', w_margin);
        */

        title_fontsize = 0.08 * w_ringchart + 'px';
        name_fontsize = 0.05 * w_ringchart + 'px';
        valuetoken_fontsize = 0.03 * w_ringchart + 'px';
    }

    function draw_side(keyword) {
        var name;
        switch (keyword) {
            case 'number': name = '인구수'; break;
            case 'work': name = '고령화지수'; break;
            case 'children': name = '가족 당 아이수'; break;
        }

        $('.' + keyword).each(function(index) {
            let img = '<img src="' + imgurl[keyword] + '">';
            let divForRight = '<div class="side-div-size"><p></p></div>';
            $(this).html('<div class="side-item-title">' + img + '</div>' + divForRight);
        });
        /*
        divs = document.getElementsByClassName(keyword);
        for (var i=0; i<divs.length; i++) {
            var img = document.createElement('img');
            img.src = imgurl[keyword];
            img.alt = "number-icon";
            divs[i].innerHTML = '';
            divs[i].append(img);
            divs[i].append(document.createElement('p'));
        }
        */
    }

    adjust_display();
    draw_side('number');
    draw_side('work');
    draw_side('children');
}
