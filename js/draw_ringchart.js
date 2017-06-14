var slices_dic = {'first': null, 'second': null};
var clicked = null;

function draw_ringchart(element_id, year){
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
       .attr("transform", set_translate(width/2, height/2));

    var data_dic = [
        {},
        {},
        {},
        year2data(year)
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
    data_dic[2]['Adult'] = sum(['20f','25f', '30f','35f'], 3);
    data_dic[2]['Middle-aged'] = sum(['40f', '45f', '50f','55f'], 3);
    data_dic[2]['Old'] = sum(['60f', '65f', '70ormore'], 3);
    data_dic[1]['Pre-economic-activity'] = sum(['Underage'], 2 )
    data_dic[1]['In-economic-activity'] = sum(['Adult', 'Middle-aged'], 2);
    data_dic[1]['Post-economic-activity'] = sum(['Old'], 2);
    data_dic[0][''] = sum(['Pre-economic-activity', 'In-economic-activity', 'Post-economic-activity'], 1);

    data_slices = [];
    var key2num = {};
    var num2degree = (a) => a*2*Math.PI/data_dic[0]['']['num'];
    var max_level = 3
    for (var level=1; level<4; level++) {
        var start_degree = 0, degree, num;
        var keys = Object.keys(data_dic[level]);
        for (var i=0; i<keys.length; i++) {
            curr_data = data_dic[level][keys[i]];
            degree = num2degree(curr_data['num']);
            data_slices.push([start_degree, start_degree+degree, keys[i], level, curr_data]);
            // add slice for text
            if (level === 3) {
                data_slices.push([start_degree-0.01, start_degree+0.01, '', level+1, i*5]);
            }
            start_degree += degree;
            key2num[keys[i]] = curr_data['num']
        }
    }
    var ref = data_slices[0];
    var next_ref = ref;
    var last_refs = [];
    var innerpadding = 2;
    var thickness = width/2.0/(max_level+3+innerpadding)*1.1;
    var arc = d3.svg.arc()
                .startAngle(function(d) {
                    //if(d[3]==0){return d[0];}
                    return d[0]+0.01;
                })
                .endAngle(function(d) {
                    //if(d[3]==0){return d[1];}
                    return d[1]-0.01;
                })
                .innerRadius(function(d) {
                    var depth = (d[3]===0)? 0 : d[3] + innerpadding;
                    return 1.1*depth*thickness;
                })
                .outerRadius(function(d) {
                    var depth = d[3] + innerpadding;
                    return (1.1*depth+1)*thickness;
                });
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
          .style("fill", function(d) { return color_function(d);})
          .style("stroke", '#ffffff')
          .style("stroke-width", 0.1*thickness)
          .attr("class","path form");

    slices.append('text')
          .attr('transform', function(d, i) {
              var centroid = arc.centroid(d);
              return set_translate(0.95*centroid[0], 0.95*centroid[1]);
          })
          .attr('dy', '0.5em')
          .text(function(d) {
              return (d[3]===4)? d[4]:'';
          })
          .style('font-size', valuetoken_fontsize)
          .style('text-anchor', 'middle');

    set_title(g, year);

    var other_slices = null;
    var other_id;
    slices_dic[element_id] = [slices, data_slices];
    if(numChart === 2) {
        other_id = (element_id === 'first')? 'second' : 'first';
        other_slices = slices_dic[other_id];
    }

    slices
        .on("mouseover", function(d, i) {
            if (d[3]===4) return;
            set_title(g, name2range(d[2]), 'subtitle');
            var slice = d3.select(this);
            slice.style('cursor', 'pointer');
            d3.select('#'+element_id+'-path'+d[2]).style('stroke', function(d, i) {return color_function(d);});
        })
        .on("mouseout", function(d, i) {
            if (d[3]===4) return;
            set_title(g, year);
            var slice = d3.select(this);
            slice.style('cursor', 'default');
            d3.select('#'+element_id+'-path'+d[2]).style('stroke', '#ffffff');
            if (clicked === null) display_legend(d, false);
        });

    slices.on("click", function(d, i) {
        if (d[3]===4) return;
        if (clicked === null || clicked !== i) {
            if (clicked !== null) mouseout(data_slices[clicked], clicked);
            display_legend(d, true);
            display_arc(d, i);
            display_relation(d, i, element_id);
            if (other_slices!==null || clicked === i) {
                display_relation(other_slices[1][i], i, other_id);
            }
            clicked = i;
        } else {
            mouseout(d, i);
            display_legend(d, false);
            clicked = null;
        }
    });
    if (other_slices!==null) {
        other_slices[0].on("click", function(d, i) {
            if (clicked === null || clicked !== i) {
                if (clicked !== null) mouseout(other_slices[1][clicked], clicked);
                display_arc(d, i);
                display_relation(d, i, other_id);
                display_relation(data_slices[i], i, element_id);
                clicked = i;
            } else {
                mouseout(d, i);
                display_legend(d, false);
                clicked = null;
            }
        });
    }

    _display_legend("." + element_id + ".tot.number", legend_function('num', data_dic[0][''], true));
    _display_legend("." + element_id + ".tot.work", legend_function('ecorate', data_dic[0][''], true));
    _display_legend("." + element_id + ".tot.children", legend_function('childrate', data_dic[0][''], true));
    _display_legend(".curr.number", "", false);
    _display_legend(".curr.work", "", false);
    _display_legend(".curr.children", "", false);

    var side_id = (element_id === 'first')? 'left': 'right';
    d3.select("#side-" + side_id + ' .tot.side-title-span').text(year);
    d3.select(".curr.side-title-span").text(year);

    function display_legend(d, display) {
        _display_legend(".curr.number", (display)? legend_function('num', d) : '', display);
        _display_legend(".curr.work", (display)? legend_function('ecorate', d) : '', false);
        _display_legend(".curr.children", (display)? legend_function('childrate', d) : '', false);
        d3.select('.curr.side-title-span').html((display)? d[2]  : year);
    }

    function _display_legend(_id, text, showimg=true) {
        d3.select(_id + " p").html(text);
        if (showimg) {
            $(_id + " img").show();
            $(_id + " .side-item-title").show();
        } else {
            $(_id + " img").hide();
            $(_id + " .side-item-title").hide();
        }
    }

    function display_arc(d, i){
        set_opacity(0.1);
        var first = d3.select('#first-slice' + d[2]);
        if (!(first == null)){
            first.style('opacity', 1);
        }
        var second = d3.select('#second-slice' + d[2]);
        if (!(second == null)){
            second.style('opacity', 1);
        }
    }

    function display_relation(d, i, eid) {
        function _display_color(_id, val, blue) {
            var r = document.getElementById(eid+'-slice'+_id);
            r.style.opacity = 1;
            r = document.getElementById(eid+'-path'+_id);
            var color = 255-Math.floor(255*(val*10)/key2num[_id]);

            if (blue && r.style.fill===r.style.stroke) {
                r.style.fill = 'rgb(255,'+color+','+color+')';
            } else if (blue) {
                r.style.fill = 'rgb(255,'+color+',255)';
            } else {
                r.style.fill = 'rgb('+color+','+color+',255)';
            }
        }
        function _display_relation(key){
            var data = d[4][key], tot = 0;
            for (age in data) tot += data[age];
            for (age in data) _display_color(age, data[age]/tot, key==='baby');
        }
        _display_relation('parent');
        _display_relation('baby');
    }

    function mouseout(d) {
        set_opacity(1);
        d3.selectAll('.path').style('fill', function(d) {return color_function(d);});
    }

}




