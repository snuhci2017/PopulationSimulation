
function init_code_hierarchy_plot(data, element_id,count_function,color_function,title_function,legend_function){

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

    console.log(width, height);
    var g = svg.append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var data = {
        '0-9': {'num':45, 'ecorate': 0.01, 'childrate': 0.00},
        '10s': {'num':64, 'ecorate': 0.3, 'childrate': 0.01},
        '20s': {'num':160, 'ecorate': 1.98, 'childrate': 0.4},
        '30s': {'num':134, 'ecorate': 8.32, 'childrate': 1.2},
        '40s': {'num':75, 'ecorate': 11.38, 'childrate': 1.6},
        '50s': {'num':90, 'ecorate': 9.43, 'childrate': 2.3},
        '60s': {'num':110, 'ecorate': 3.71, 'childrate': 3.6},
        'Up to 70s': {'num':43, 'ecorate': 0.2, 'childrate': 4.4}
    };
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
            if (i==0) {
                s['num'] = curr_s['num'];
                s['ecorate'] = curr_s['ecorate'];
                s['childrate'] = curr_s['childrate']
            } else {
                var totnum = s['num'] + curr_s['num']
                s['ecorate'] = (s['ecorate']*s['num']+curr_s['ecorate']*curr_s['num'])/totnum;
                s['childrate'] = (s['childrate']*s['num']+curr_s['childrate']*curr_s['num'])/totnum;
                s['num'] = totnum;
            }
        }
        return s;
    }

    data_dic[2]['Underage'] = sum(['0-9', '10s'], 3);
    data_dic[2]['Adault'] = sum(['20s', '30s'], 3);
    data_dic[2]['Middle-aged'] = sum(['40s', '50s'], 3);
    data_dic[2]['Old'] = sum(['60s', 'Up to 70s'], 3);
    data_dic[1]['Pre-economic-activity'] = sum(['Underage'], 2 )
    data_dic[1]['In-economic-activity'] = sum(['Adault', 'Middle-aged'], 2);
    data_dic[1]['Post-economic-activity'] = sum(['Old'], 2);
    data_dic[0][''] = sum([
          'Pre-economic-activity', 'In-economic-activity', 'Post-economic-activity'
        ], 1);

    data_slices = [];
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
                       .attr("class", "slice");

    slices.append("path")
          .attr("d", arc)
          .attr("id",function(d,i){return element_id+'-'+d[2];})
          .style("fill", function(d) { return color_function(d);})
          .attr("class","form");

    slices.on("click",animate);

    if (title_function != undefined) {
        slices.append("svg:title")
              .text(title_function);
    }

    if (legend_function != undefined) {
        slices.on("mouseover", mouseover)
              .on("mouseout", mouseout);
        d3.select(".tot.number p").html(legend_function('num', data_slices[0]));
        d3.select(".tot.work p").html(legend_function('ecorate', data_slices[0]));
        d3.select(".tot.children p").html(legend_function('childrate', data_slices[0]));
        function mouseover(d) {
            d3.select(".curr.number p").html(legend_function('num', d));
            d3.select(".curr.work p").html(legend_function('ecorate', d));
            d3.select(".curr.children p").html(legend_function('childrate', d));
            set_opacity(0.2);
            this.style.opacity = 1;

        }
        function mouseout(d) {
            set_opacity(1);
        }
        function set_opacity(op) {
            var gs = $(".slice");
            for (var i=0; i<gs.length; i++) {
                gs[i].style.opacity = op;
            }
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




