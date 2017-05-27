/*
format of data is [
    {year: 1928, factor1: 102, factor2: 103},
    ...
]
*/

var factorValue = {
    'marriage rate': 0,
    'divorce rate': 1.0,
    'private education expenses': 20.0,
};

var selectedFactor = 'marriage rate';
const factorList = ['marriage rate', 'divorce rate', 'private education expenses'];

function loadFactor() {
    queue()
        .defer(d3.csv, "data/factor_marriage_divorce_rate.csv")
        .defer(d3.csv, "data/factor_private_education.csv")
        .await(function(error, file1, file2) {
            if (error) {
                console.error('csv load error :' + error);
                return;
            }
            let json = {};
            function loadOneFactor(id, file) {
                json[id] = {
                    id: id,
                    values: file.map((d) => {
                        return {
                            year : d.year,
                            value : d[id],
                        }
                    })
                }
            }
            loadOneFactor('marriage rate', file1);
            loadOneFactor('divorce rate', file1);
            loadOneFactor('private education expenses', file2);
            draw_factor(json);
            window.addEventListener('resize', () => {
                draw_factor(json);
            });
        });
}

function clickcancel() {
    var event = d3.dispatch('click', 'dblclick');
    function cc(selection) {
        var down = null,
            tolerance = 5,
            last,
            wait = null;
        // euclidean distance
        function dist(a, b) {
            return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
        }
        selection.on('mousedown', function() {
            down = d3.mouse(this);
            last = +new Date();
        });
        selection.on('mouseup', function() {
            if (down !== null && dist(down, d3.mouse(this)) > tolerance) {
                return;
            } else {
                if (wait) {
                    window.clearTimeout(wait);
                    wait = null;
                    event.dblclick(d3.event);
                } else {
                    wait = window.setTimeout((function(e) {
                        return function() {
                            event.click(e);
                            wait = null;
                        };
                    })(d3.event), 300);
                }
            }
        });
    };
    return d3.rebind(cc, event, 'on');
}

function draw_factor(data) {
    const svg = d3.select('svg#factor-graph');
    svg.html('');
    const charts = svg.append('g');
    const svgMargin = {
        x: 0, y: 0
    }
    const chartMargin = {
        left: 50, right: 50, top: 20, bottom: 20
    }
    const containerWidth = $('#factor-container').width();
    const containerHeight = $('#factor-container').height();
    const chartWidth = containerWidth - svgMargin.x * 2 - chartMargin.left - chartMargin.right;
    const chartHeight = containerHeight - svgMargin.y * 2 - chartMargin.top - chartMargin.bottom;
    svg.style('width', containerWidth - svgMargin.x * 2).style('height', containerHeight - svgMargin.y * 2);
    const maxYear = 2060;

    const xScale = d3.scale.linear()
                    .domain([1960, maxYear])
                    .range([0, chartWidth])

    let yScales = {};
    factorList.forEach((id) => {
        yScales[id] = d3.scale.linear()
                        .domain([0, d3.max(data[id].values, (d) => (d.value))])
                        .range([chartHeight, 0])
    });
    const colorScale = d3.scale.category10().domain(factorList);

    let lines = {};
    factorList.forEach((id) => {
        lines[id] = d3.svg.line().interpolate('line')
                        .x((d) => xScale(d.year))
                        .y((d) => yScales[id](d.value));

    });

    let g = svg.append('g')
                .attr('transform', d3.transform().translate(chartMargin.left,chartMargin.top));

    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', d3.transform().translate(0, chartHeight))
        .call(d3.svg.axis().scale(xScale).orient('bottom'));

    g.append("g")
        .attr("class", "axis axis-y")
        .call(d3.svg.axis().scale(yScales[selectedFactor]).orient('left'));

    let lineChart = g.append('g').attr('class', 'line-chart');

    let lineData;
    function updateLineData() {
        lineData = factorList.map((factorName) => {
            return {
                id: factorName,
                values: data[factorName].values
                    .concat([{year: maxYear, value: factorValue[factorName]}])
            }
        });
    }
    updateLineData();

    let factorLine = lineChart.selectAll('.factor-line')
        .data(lineData)
        .enter().append('g').attr('class', 'factor-line');

    let factorPath = factorLine.append('path')
            .attr('class', 'factor-path')
            .attr('d', (d) => lines[d.id](d.values))
            .style('stroke', (d) => colorScale(d.id));

    let dragFactor = d3.behavior.drag()
        .on('drag', factorDragged);

    factorLine.append('text').call(setFactorLabel);

    function setFactorLabel(selection) {
        selection
            .attr('class', 'factor-label')
            .datum((d) => {
                return {id: d.id, value: d.values[d.values.length - 1]}
            })
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.value.year), yScales[d.id](d.value.value)])
            )
            .text((d) => d.id);
    }

    factorLine.append('circle')
            .on('mousedown',(d) => {
                selectedFactor = d.id;
                updateFocused();
            })
            .call(setFactorHandle)
            .call(dragFactor);

    function setFactorHandle(selection) {
        selection
            .datum((d) => {
                return {id: d.id, value: d.values[d.values.length - 1]}
            })
            .attr('class', 'factor-handle')
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.value.year), yScales[d.id](d.value.value)])
            )
            .attr('r', 10)
            .attr('z-index', 1)
            .attr('fill', (d) => colorScale(d.id))
    }

    function factorDragged(d) {
        let value = yScales[d.id].invert(d3.event.y);
        const range = yScales[d.id].domain();
        value = Math.max(value, range[0]);
        value = Math.min(value, range[1]);
        factorValue[d.id] = value;
        updateLineData();
        const tmpLineChart = lineChart.selectAll('.factor-line').data(lineData);
        tmpLineChart.select('.factor-path')
            .attr('d', (d) => lines[d.id](d.values));

        tmpLineChart.select('.factor-handle')
            .call(setFactorHandle);

        tmpLineChart.select('.factor-label')
            .call(setFactorLabel);
    }

    function updateFocused() {
        if (selectedFactor === null) {
            g.select('.axis-y').transition().attr('opacity', 0);
        } else {
            g.select('.axis-y').call(d3.svg.axis().scale(yScales[selectedFactor]).orient('left')).transition().attr('opacity',1);
        }
        const tmpLineChart = lineChart.selectAll('.factor-line').data(lineData).transition()
            .attr('opacity', (d) => {
                if (d.id === selectedFactor) {
                    return 1;
                } else {
                    return 0.2;
                }
            });
    }

    updateFocused();

    // MARK: time line
    // TODO: time into data and bind it
    let time1 = 1970;
    let time2 = 1920;
    const timeRange = {max: maxYear, min: 1970};

    let doubleClick = clickcancel()
        .on('dblclick', (d) => {
            let value = xScale.invert(d.x - 50); //FIXME: not appropriate
            value = Math.max(value, timeRange.min);
            value = Math.min(value, timeRange.max);
            value = Math.round(value / 5) * 5;
            time2 = value;
            g.select('.timeline2').attr('transform', d3.transform().translate(xScale(time2),0))
                .attr('opacity', 1)
            let timeChangeEvent = new CustomEvent('time_changed', {'detail' : {year: value, id: 'right'}});
            document.dispatchEvent(timeChangeEvent);
        })

    g.append('rect')
        .attr('width', chartWidth).attr('height', chartHeight).attr('opacity', 0)
        .call(doubleClick);

    let dragTimeline1 = d3.behavior.drag()
        .origin(() => ({x: xScale(time1), y: 0}))
        .on('drag', timelineDragged1);

    function timelineDragged1() {
        value = xScale.invert(d3.event.x);
        value = Math.max(value, timeRange.min);
        value = Math.min(value, timeRange.max);
        value = Math.round(value / 5) * 5;
        time1 = value;
        d3.select(this).attr('transform',
                                d3.transform().translate(xScale(value),0)
                            );
        let id = 'left';
        if (time2 === 1920)
            id = 'center';
        let timeChangeEvent = new CustomEvent('time_changed', { 'detail' : {year: value, id: id}});
        document.dispatchEvent(timeChangeEvent);
    }

    let dragTimeline2 = d3.behavior.drag()
        .origin(() => ({x: xScale(time2), y: 0}))
        .on('drag', timelineDragged2);

    function timelineDragged2() {
        let value = xScale.invert(d3.event.x);
        value = Math.max(value, timeRange.min);
        value = Math.min(value, timeRange.max);
        value = Math.round(value / 5) * 5;
        time2 = value;
        d3.select(this).attr('transform',
                                d3.transform().translate(xScale(value),0)
                            );
        let timeChangeEvent = new CustomEvent('time_changed', {'detail' : {year: value, id: 'right'}});
        document.dispatchEvent(timeChangeEvent);
    }

    let timeLine = g.append('line')
                        .attr('class','timeline')
                        .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2',chartHeight)
                        .attr('transform',
                            d3.transform().translate(xScale(time1),0)
                        )
                        .call(dragTimeline1);

    let timeLine2 = g.append('line')
                        .attr('class','timeline2')
                        .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2',chartHeight)
                        .attr('transform',
                            d3.transform().translate(xScale(time2),0)
                        )
                        .attr('opacity', 0)
                        .call(dragTimeline2);


}
