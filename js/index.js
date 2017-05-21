(function() {


    $(initialize);

    function initialize() {
        function count_function(d) {
            return d[1][0];
        }
        function label_function(d) {
            return d[4][1];
        }
        function legend_function(d) {
            var description = (d[4][0]=='')? 'Total population' : 'Population of ' + d[4][0];
            return description + " is " + d[4][1] + ".";
        }
        var color = d3.scale.category20c();
        function color_function(d) { return color(d[2]);}
        init_code_hierarchy_plot("ring-chart", count_function, color_function, label_function, legend_function);
    }


})();;
