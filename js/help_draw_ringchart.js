

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
    }
    return text;
}
function set_title(g, text) {
    g.select('text#title').remove();
    var title = g.append('text')
      .text(text)
      .style('font-size', title_fontsize)
      .attr('id', 'title');
    var title_width = title.style('width');
    title_width = title_width.substring(0, title_width.length-2);
    title.attr('transform', set_translate(-title_width/2, 0));
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
function rebaseTween(new_ref) {
    return function(d) {
        var level = d3.interpolate(get_level(d,ref),get_level(d,new_ref));
        var start_deg = d3.interpolate(get_start_angle(d,ref),get_start_angle(d,new_ref));
        var stop_deg = d3.interpolate(get_stop_angle(d,ref),get_stop_angle(d,new_ref));
        var opacity = d3.interpolate(100,0);
        return function(t){ return arc([start_deg(t),stop_deg(t),d[2],level(t)]);  }
    }
}

var animating = false;

function animate(d) {
    if (animating) return;
    animating = true;
    var revert = false;
    var new_ref;
    if (d == ref && last_refs.length > 0) {
        revert = true;
        last_ref = last_refs.pop();
    }
    if (revert) {
        d = last_ref;
        new_ref = ref;
        svg.selectAll(".form")
            .filter(function (b){
                return (b[0]>=last_ref[0] && b[1]<=last_ref[1] && b[3]>=last_ref[3]);
            })
            .transition().duration(1000).style("opacity","1").attr("pointer-events","all");
    } else {
        new_ref = d;
        svg.selectAll(".form")
        .filter(function (b) {return (b[0] < d[0] || b[1] > d[1] || b[3] < d[3]);})
        .transition().duration(1000).style("opacity","0").attr("pointer-events","none");
    }
    svg.selectAll(".form")
       .filter(function(b){return (b[0]>=new_ref[0] && b[1]<=new_ref[1] && b[3]>=new_ref[3]);})
       .transition().duration(1000).attrTween("d",rebaseTween(d));
    setTimeout(function(){
          animating = false;
          if (! revert) {
              last_refs.push(ref);
              ref = d;
          } else {
              ref = d;
          }}, 1000);
}




