function init_code_hierarchy_plot(element_id,count_function,color_function,title_function,legend_function){

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

    data_dic = [
                {},
                {},
                {},
                {'0-9': 45, '10s': 70, '20s': 50, '30s': 60,
                '40s': 65, '50s': 75, '60s': 35, '70s': 30, 'Up to 80': 10}
                ];

    function sum(l, level) {
        var s = 0;
        for(var i=0; i<l.length; i++) {
            s += data_dic[level][l[i]];
        }
        return s;
    }

    data_dic[2]['Underage'] = sum(['0-9', '10s'], 3);
    data_dic[2]['Adault'] = sum(['20s', '30s'], 3);
    data_dic[2]['Middle-aged'] = sum(['40s', '50s'], 3);
    data_dic[2]['Old'] = sum(['60s', '70s', 'Up to 80'], 3);
    data_dic[1]['Pre-economic-activity'] = sum(['Underage'], 2 )
    data_dic[1]['In-economic-activity'] = sum(['Adault', 'Middle-aged'], 2);
    data_dic[1]['Post-economic-activity'] = sum(['Old'], 2);
    data_dic[0][''] = sum([
          'Pre-economic-activity', 'In-economic-activity', 'Post-economic-activity'
        ], 1);


    data_slices = [];
    var num2degree = (a) => a*2*Math.PI/data_dic[0][''];
    var max_level = 3
    for (var level=0; level<4; level++) {
        var start_degree = 0, degree, num;
        var keys = Object.keys(data_dic[level]);
        for (var i=0; i<keys.length; i++) {
            num = data_dic[level][keys[i]];
            degree = num2degree(num);
            data_slices.push([start_degree, start_degree+degree, keys[i], level, [keys[i], num]]);
            start_degree += degree;
        }
    }

    var ref = data_slices[0];
    var next_ref = ref;
    var last_refs = [];
    var thickness = width/2.0/(max_level+2)*1.1;

    console.log(data_slices);

    var arc = d3.svg.arc()
                .startAngle(function(d) { if(d[3]==0){return d[0];}return d[0]+0.01; })
                .endAngle(function(d) { if(d[3]==0){return d[1];}return d[1]-0.01; })
                .innerRadius(function(d) { return 1.1*d[3]*thickness; })
                .outerRadius(function(d) { return (1.1*d[3]+1)*thickness; });
    var slices = g.selectAll(".form")
                   .data(function(d) { return data_slices; })
                   .enter()
                       .append("g");
    slices.append("path")
          .attr("d", arc)
          .attr("id",function(d,i){return element_id+i;})
          .style("fill", function(d) { return color_function(d);})
          .attr("class","form");
    slices.on("click",animate);
    if (title_function != undefined) {
        slices.append("svg:title")
              .text(title_function);
    }
    if (legend_function != undefined) {
        slices.on("mouseover",update_legend)
              .on("mouseout",remove_legend);
        var legend = d3.select("#"+element_id+"-legend");
        function update_legend(d) {
            legend.html(legend_function(d));
            legend.transition().duration(200).style("opacity","1");
        }
        function remove_legend(d) {
            legend.transition().duration(1000).style("opacity","0");
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


