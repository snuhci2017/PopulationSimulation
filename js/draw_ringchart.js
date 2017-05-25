var slices_dic = {'first': null, 'second': null};
var clicked = null;

function init_code_hierarchy_plot(data, element_id, numChart, count_function,color_function,title_function,legend_function){


    var plot = document.getElementById(element_id);

    while (plot.hasChildNodes()){
        plot.removeChild(plot.firstChild);
    }


    var x_margin = 0;
    var y_margin = 0;
    var max_depth=3;
    var svg = d3.select("#"+element_id),
        width = svg.style('width'),
        height = svg.style('height');

    width = width.substring(0, width.length-2);
    height = height.substring(0, height.length-2);

    var g = svg.append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var data_dic = [
        {},
        {},
        {},
        data
    ];

    function sum(l, level) {
        var s = {};
        for(var i=0; i<l.length; i++) {
            var curr_s = data_dic[level][l[i]];
            // assume curr_s and s is a dictionary having keys of 'num', 'ecorate', 'childrate'
            function put(k) {
                for (age in curr_s[k]) {
                    if (age in s[k]) s[k][age] += curr_s[k][age];
                    else s[k][age] = curr_s[k][age];
                }
            }
            if (i==0) {
                s['num'] = curr_s['num'];
                s['ecorate'] = curr_s['ecorate'];
                s['childrate'] = curr_s['childrate']
                s['parent'] = {};
                s['baby'] = {};
            } else {
                var totnum = s['num'] + curr_s['num']
                s['ecorate'] = (s['ecorate']*s['num']+curr_s['ecorate']*curr_s['num'])/totnum;
                s['childrate'] = (s['childrate']*s['num']+curr_s['childrate']*curr_s['num'])/totnum;
                s['num'] = totnum;
            }
            put('parent');
            put('baby');
        }
        return s;
    }


    data_dic[2]['Underage'] = sum(['0f', '5f', '10f', '15f'], 3);
    data_dic[2]['Adault'] = sum(['20f','25f', '30f','35f'], 3);
    data_dic[2]['Middle-aged'] = sum(['40f', '45f', '50f','55f'], 3);
    data_dic[2]['Old'] = sum(['60f', '65f', '70ormore'], 3);
    data_dic[1]['Pre-economic-activity'] = sum(['Underage'], 2 )
    data_dic[1]['In-economic-activity'] = sum(['Adault', 'Middle-aged'], 2);
    data_dic[1]['Post-economic-activity'] = sum(['Old'], 2);
    data_dic[0][''] = sum([
          'Pre-economic-activity', 'In-economic-activity', 'Post-economic-activity'
        ], 1);

    data_slices = [];
    var key2num = {};
    var num2degree = (a) => a*2*Math.PI/data_dic[0]['']['num'];
    var max_level = 3
    for (var level=0; level<4; level++) {
        var start_degree = 0, degree, num;
        var keys = Object.keys(data_dic[level]);
        for (var i=0; i<keys.length; i++) {
            curr_data = data_dic[level][keys[i]];
            degree = num2degree(curr_data['num']);
            data_slices.push([start_degree, start_degree+degree, keys[i], level, curr_data]);
            start_degree += degree;
            key2num[keys[i]] = curr_data['num']
        }
    }

    var ref = data_slices[0];
    var next_ref = ref;
    var last_refs = [];
    var thickness = width/2.0/(max_level+2)*1.1;

    var arc = d3.svg.arc()
                .startAngle(function(d) { if(d[3]==0){return d[0];}return d[0]+0.01; })
                .endAngle(function(d) { if(d[3]==0){return d[1];}return d[1]-0.01; })
                .innerRadius(function(d) { return 1.1*d[3]*thickness; })
                .outerRadius(function(d) { return (1.1*d[3]+1)*thickness; });
    var slices = g.selectAll(".form")
                   .data(function(d) { return data_slices; })
                   .enter()
                       .append("g")
                       .attr("id", function(d, i) {
                         return element_id+"-slice" + d[2];
                       })
                       .attr("class", "slice " + element_id);

    slices.append("path")
          .attr("d", arc)
          .attr("id",function(d,i){return element_id+'-path'+d[2];})
          .attr("class", "path")
          .style("fill", function(d) { return color_function(d);})
          .style("stroke", function(d) { return color_function(d);})
          .attr("class","form");

    function append_text(slice, text) {
        slice.append('text')
            .attr('transform', function(d) {
                return 'translate(' + arc.centroid(d) + ')';
            })
            .attr('dy', '0.5em')
            .text(function(d) {return text;});
    }
    function remove_text(slice) {
        slice.select('text').remove();
    }

    slices.append("svg:title")
              .text(title_function);

    slices_dic[element_id] = [slices, data_slices];

    var other_slices = null;
    var other_id;

    if(numChart == 2) {
        other_id = (element_id === 'first')? 'second' : 'first';
        other_slices = slices_dic[other_id];
    }

    slices
        .on("mouseover", function(d, i) {
            var slice = d3.select(this);
            slice.style('cursor', 'pointer');
            append_text(slice, d[2]);
        })
        .on("mouseout", function(d, i) {
            var slice = d3.select(this);
            slice.style('cursor', 'default');
            if (i!==clicked) remove_text(slice);
        });
    slices.on("click", function(d, i) {
        if (clicked === null || clicked !== i) {
            display_legend(d, i);
            display_relation(d, i, element_id);
            if (other_slices!==null) {
                display_relation(other_slices[1][i], i, other_id);
            }
            clicked = i;
        } else {
            mouseout(d, i);
            clicked = null;
        }
    });
    if (other_slices!==null) {
        other_slices[0].on("click", function(d, i) {
            if (clicked === null || clicked !== i) {
                display_legend(d, i);
                display_relation(d, i, other_id);
                display_relation(data_slices[i], i, element_id);
                clicked = i;
            } else {
                mouseout(d, i);
                clicked = null;
            }
        });
    }

    d3.select("." + element_id + ".tot.number p").html(legend_function('num', data_slices[0]));
    d3.select("." + element_id + ".tot.work p").html(legend_function('ecorate', data_slices[0]));
    d3.select("." + element_id + ".tot.children p").html(legend_function('childrate', data_slices[0]));

    function display_legend(d, i) {
        d3.select(".curr.number p").html(legend_function('num', d));
        d3.select(".curr.work p").html(legend_function('ecorate', d));
        d3.select(".curr.children p").html(legend_function('childrate', d));
        set_opacity(0.2);
        remove_all_text();
        var first = d3.select('#first-slice' + d[2]);
        if (!(first == null)){
            first.style('opacity', 1);
            append_text(first, d[2]);
        }
        var second = d3.select('#second-slice' + d[2]);
        if (!(second == null)){
            second.style('opacity', 1);
            append_text(second, d[2]);
        }
    }

    function display_relation(d, i, eid) {
        function _display_relation(_id, val, blue) {
            var r = document.getElementById(eid+'-slice'+_id);
            r.style.opacity = 1;
            r = document.getElementById(eid+'-path'+_id);
            var color = 255-Math.floor(255*(val/1000)/key2num[_id]);
            if (blue && r.style.fill===r.style.stroke)
                r.style.fill = 'rgb('+color+','+color+',255)';
            else if (blue)
                r.style.fill = 'rgb(255,'+color+',255)';
            else
                r.style.fill = 'rgb(255,'+color+','+color+')';
        }

        for (age in d[4]['parent']) {
            _display_relation(age, d[4]['parent'][age], false);
        }

        for (age in d[4]['baby']) {
            _display_relation(age, d[4]['baby'][age], true);
        }
    }

    function mouseout(d) {
        set_opacity(1);
        remove_all_text();
    }

    function remove_all_text(){
        d3.selectAll('.slice').select('text').remove();
    }


    function set_opacity(op) {
        var gs = $(".slice");
        for (var i=0; i<gs.length; i++) {
            gs[i].style.opacity = op;
        }
        gs = $('path');
        for (var i=0; i<gs.length; i++) {
            gs[i].style.fill = gs[i].style.stroke;
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
}




