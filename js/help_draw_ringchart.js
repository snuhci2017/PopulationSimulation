
function set_translate(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

function set_opacity(op) {
    var gs = $("#population-container .slice");
    for (var i=0; i<gs.length; i++) {
        gs[i].style.opacity = op;
    }
}

function name2range(text) {
    if (text.toString().endsWith('f')) {
        var age = parseInt(text.substr(0, text.length-1));
        text = age + '~' + (age+5);
    } else if (text === '70ormore') {
        text = "70 or older";
    }
    return text;
}

function title_function(d) {
    return d[4]['num'];
}

function legend_function(type, d, title=false) {
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


function set_title(g, text, _class = 'title') {
    g.selectAll('text.title').remove();
    g.selectAll('text.subtitle').remove();
    if (text.toString().endsWith('economic-activity')) {
        var ind = text.indexOf('-activity');
        _set_title(text.substring(0, ind), '-1px', '-0.5em');
        _set_title(text.substring(ind, text.length), '-1px', '0.5em');
    } else {
        _set_title(text, 'normal', '0');
    }

    function _set_title(_text, _ls, _dy) {
        var title = g.append('text')
          .text(_text)
          .style('font-size', (_class === 'title')? title_fontsize:name_fontsize)
          .style('letter-spacing', _ls)
          .attr('dy', _dy)
          .attr('class', _class);
        var title_width = title.style('width');
        title_width = title_width.substring(0, title_width.length-2);
        title.attr('transform', set_translate(-title_width/2, 0));
    }

}

function get_start_angle(d,ref) {
    if (ref) {
        var ref_span = ref[1]-ref[0];
        return (d[0]-ref[0])/ref_span*Math.PI*2.0
    } else {
        return d[0];
    }
}

function get_stop_angle(d,ref) {
    if (ref) {
        var ref_span = ref[1]-ref[0];
        return (d[1]-ref[0])/ref_span*Math.PI*2.0
    } else {
        return d[0];
    }
}

function get_level(d,ref){
    if (ref){
        return d[3]-ref[3];
    } else {
        return d[3];
    }
}
