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
    }

    adjust_display();
    draw_side('number');
    draw_side('work');
    draw_side('children');
}
