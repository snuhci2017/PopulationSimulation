/*
format of data is [
    {year: 1928, factor1: 102, factor2: 103},
    ...
]
*/

var factorValue = {
    'marriage rate': 3.0,
    'divorce rate': 2.0,
    'private education expenses': 28.0,
};

var selectedFactor = 'marriage rate';
const factorList = ['marriage rate', 'divorce rate', 'private education expenses'];
var selectedTime = [{time: 1970}];

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
                            year : Number(d.year),
                            value : Number(d[id]),
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

function doubleClick() {
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
        selection.on('mouseup', function(d,i) {
            if (down !== null && dist(down, d3.mouse(this)) > tolerance) {
                return;
            } else {
                if (wait) {
                    window.clearTimeout(wait);
                    wait = null;
                    event.dblclick(d,i);
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
        left: 50, right: 100, top: 20, bottom: 20
    }
    const containerWidth = $('#factor-container').width();
    const containerHeight = $('#factor-container').height();
    const chartWidth = containerWidth - svgMargin.x * 2 - chartMargin.left - chartMargin.right;
    const chartHeight = containerHeight - svgMargin.y * 2 - chartMargin.top - chartMargin.bottom;
    svg.style('width', containerWidth - svgMargin.x * 2).style('height', containerHeight - svgMargin.y * 2);
    const maxYear = 2060;
    const timeRange = {max: maxYear, min: 1970};

    const xScale = d3.scale.linear()
                    .domain([1960, maxYear])
                    .range([0, chartWidth])

    let yScales = {};
    factorList.forEach((id) => {
        yScales[id] = d3.scale.linear()
                        .domain([0.0, d3.max(data[id].values, (d) => (d.value)) * 1.2])
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

    // MARK: chart background
    let chartDClick = doubleClick()
        .on('dblclick', (d) => {
            if (selectedTime.length !== 1) return;
            let value = xScale.invert(d3.event.x - 50); //FIXME: not appropriate
            value = Math.max(value, timeRange.min);
            value = Math.min(value, timeRange.max);
            value = Math.round(value / 5) * 5;
            let id = null;
            if (value > selectedTime[0].time) {
                selectedTime.splice(1,0, {time: value});
                id = 'right';
            } else {
                selectedTime.splice(0,0, {time: value});
                console.log(selectedTime);
                id = 'left';
            }
            updateTimeline();
            let timeChangeEvent = new CustomEvent('time_changed', {'detail' : {year: value, id: 'right'}});
            document.dispatchEvent(timeChangeEvent);
        })

    g.append('rect')
        .attr('width', chartWidth).attr('height', chartHeight).attr('opacity', 0)
        .call(chartDClick);

    // MARK: handle container
    let handleContainer = g.append('g');

    handleContainer.selectAll('.factor-label').data(factorList)
        .enter()
        .append('text').call(setFactorLabel);

    let dragFactor = d3.behavior.drag()
        .on('drag', factorDragged);

    function setFactorLabel(selection) {
        selection
            .attr('class', 'factor-label')
            .attr('transform', d3.transform()
                .translate((d) => [xScale(maxYear) + 15, yScales[d](factorValue[d])])
            )
            .text((d) => d);
    }

    handleContainer.selectAll('.factor-handle').data(factorList)
        .enter()
        .append('circle')
        .on('mousedown',(d) => {
            selectedFactor = d;
            updateFocused();
        })
        .call(setFactorHandle)
        .call(dragFactor);

    function setFactorHandle(selection) {
        selection
            .attr('class', 'factor-handle')
            .attr('transform', d3.transform()
                .translate((d) => [xScale(maxYear), yScales[d](factorValue[d])])
            )
            .attr('r', 10)
            .attr('z-index', 1)
            .attr('fill', (d) => colorScale(d))
    }

    function factorDragged(d) {
        let value = yScales[d].invert(d3.event.y);
        const range = yScales[d].domain();
        value = Math.max(value, range[0]);
        value = Math.min(value, range[1]);
        factorValue[d] = value;
        updateLineData();
        const tmpLineChart = lineChart.selectAll('.factor-line').data(lineData);
        tmpLineChart.select('.factor-path')
            .attr('d', (d) => lines[d.id](d.values));

        handleContainer.selectAll('.factor-handle').data(factorList)
            .call(setFactorHandle);

        handleContainer.selectAll('.factor-label').data(factorList)
            .call(setFactorLabel);
    }

    function updateFocused() {
        if (selectedFactor === null) {
            g.select('.axis-y').attr('opacity', 0);
        } else {
            g.select('.axis-y').call(d3.svg.axis().scale(yScales[selectedFactor]).orient('left')).attr('opacity',1);
        }
        const tmpLineChart = lineChart.selectAll('.factor-line').data(lineData).transition()
            .attr('opacity', (d) => {
                if (d.id === selectedFactor) {
                    return 1;
                } else {
                    return 0.2;
                }
            });
        handleContainer.selectAll('.factor-handle').data(factorList).transition()
            .attr('opacity', (d) => {
                if (d === selectedFactor) {
                    return 1;
                } else {
                    return 0.2;
                }
            });
    }

    updateFocused();

    let dragTimeline = d3.behavior.drag()
        .origin((d) => ({x: xScale(d.time), y: 0}))
        .on('drag', timelineDragged);

    function timelineDragged(d,i) {
        let value = xScale.invert(d3.event.x);
        value = Math.max(value, timeRange.min);
        value = Math.min(value, timeRange.max);
        value = Math.round(value / 5) * 5;
        if (i === 0 && selectedTime.length === 2) {
            value = Math.min(value, selectedTime[1].time);
        } else if(i === 1) {
            value = Math.max(value, selectedTime[0].time);
        }
        d.time = value;
        d3.select(this)
            .attr('transform', d3.transform()
                .translate(xScale(value), 0)
            );
        emitTimelineEvent(i);
    }

    function emitTimelineEvent(i) {
        let id = null;
        if (selectedTime.length === 1) {
            id = 'center';
        } else {
            id = (i === 0 ? 'left' : 'right');
        }
        let timeChangeEvent = new CustomEvent('time_changed', {'detail' : {year: selectedTime[i].time, id: id}});
        document.dispatchEvent(timeChangeEvent);
    }

    let timelineDClick = doubleClick()
        .on('dblclick', (d,i) => {
            console.log(i);
            if (selectedTime.length === 1) return;
            selectedTime.splice(i,1);
            console.log(selectedTime);
            let timeChangeEvent = new CustomEvent('time_changed', {'detail' : {year: selectedTime[0].time, id: 'center'}});
            document.dispatchEvent(timeChangeEvent);
            updateTimeline();
        });

    function updateTimeline() {
        let timeLine = g.selectAll('.timeline')
                        .data(selectedTime)

        timeLine
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.time),0])
            )

        let timeLineEnter = timeLine
                                .enter()
                                    .append('g')
                                        .attr('class', 'timeline')
                                        .attr('transform',
                                            d3.transform().translate((d) => [xScale(d.time),0])
                                        )
                                        .call(dragTimeline)
                                        .call(timelineDClick);

        timeLineEnter.append('line')
                .attr('x1', 0).attr('x2', 0).attr('y1', -10).attr('y2',chartHeight+10);
        timeLineEnter.append('rect')
                .attr('width', 20).attr('height', chartHeight).attr('x', -10);

        timeLine.exit()
            .transition()
                .style('opacity', 0)
                .remove();
    }

    updateTimeline();

}
