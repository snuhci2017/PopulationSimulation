/*
format of data is [
    {year: 1928, factor1: 102, factor2: 103},
    ...
]
*/

var factorValue = {
    factor1: 0, factor2: 10, factor3: 10000,
};

function draw_factor(data) {
    const svg = d3.select('svg#factor-graph');
    const charts = svg.append('g');
    const svgMargin = {
        x: 0, y: 0
    }
    const chartMargin = {
        left: 20, right: 50, top: 20, bottom: 20
    }
    const containerWidth = $('#factor-container').width();
    const containerHeight = $('#factor-container').height();
    const chartWidth = containerWidth - svgMargin.x * 2 - chartMargin.left - chartMargin.right;
    const chartHeight = containerHeight - svgMargin.y * 2 - chartMargin.top - chartMargin.bottom;
    svg.style('width', containerWidth - svgMargin.x * 2).style('height', containerHeight - svgMargin.y * 2);
    const factorList = ['factor1', 'factor2', 'factor3'];
    const maxYear = 2020;

    const xScale = d3.scale.linear()
                    .domain([
                        d3.min(data, (d) => (d.year)), maxYear
                    ])
                    .range([0, chartWidth])
    let yScales = {};
    factorList.forEach((id) => {
        yScales[id] = d3.scale.linear()
                        .domain([0, d3.max(data, (d) => (d[id]))])
                        .range([chartHeight, 0])
    });
    const colorScale = d3.scale.category10().domain(factorList);

    let lines = {};
    factorList.forEach((id) => {
        lines[id] = d3.svg.line().interpolate('cardinal')
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
        .call(d3.svg.axis().scale(yScales['factor1']).orient('left'));

    let lineChart = g.append('g').attr('class', 'line-chart');

    let lineData;
    function updateLineData() {
        lineData = factorList.map((factorName) => {
            return {
                id: factorName,
                values: data.map((d) => {
                    return {
                        year: d.year,
                        value: d[factorName],
                    }
                }).concat([{year: maxYear, value: factorValue[factorName]}])
            }
        });
    }
    updateLineData();

    let factorLine = lineChart.selectAll('.factor-line')
        .data(lineData)
        .enter().append('g').attr('class', 'factor-line');

    let factorPath = factorLine.append('path')
            .attr('class', 'line')
            .attr('d', (d) => lines[d.id](d.values))
            .style('stroke', (d) => colorScale(d.id));

    let dragFactor = d3.behavior.drag()
        //.origin((d) => ({x: xScale(maxYear), y: yScales[d.id](d.value)}))
        .on('drag', factorDragged);

    function factorDragged(d) {
        let value = yScales[d.id].invert(d3.event.y);
        const range = yScales[d.id].domain();
        value = Math.max(value, range[0]);
        value = Math.min(value, range[1]);
        factorValue[d.id] = value;
        updateLineData();
        // TODO: refactoring for enter update model
        const tmpLineChart = lineChart.selectAll('.factor-line').data(lineData);
        tmpLineChart.select('.line')
            .attr('d', (d) => lines[d.id](d.values));
        tmpLineChart.select('.factor-handle')
            .datum((d) => {
                    return {id: d.id, value: d.values[d.values.length - 1]}
            })
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.value.year), yScales[d.id](d.value.value)])
            )
    }

    factorLine.append('text')
            .datum((d) => {
                return {id: d.id, value: d.values[d.values.length - 1]}
            })
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.value.year), yScales[d.id](d.value.value)])
            )
            .text((d) => d.id);

    factorLine.append('circle')
            .datum((d) => {
                return {id: d.id, value: d.values[d.values.length - 1]}
            })
            .attr('class', 'factor-handle')
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.value.year), yScales[d.id](d.value.value)])
            )
            .attr('r', 10)
            .attr('fill', (d) => colorScale(d.id))
            .call(dragFactor);

    // MARK: time line
    let time = 1950;
    const timeRange = {max: 2010, min: 1930};
    let dragTimeline = d3.behavior.drag()
        .origin(() => ({x: xScale(time), y: 0}))
        .on('drag', timelineDragged);
    function timelineDragged() {
        time = xScale.invert(d3.event.x);
        time = Math.max(time, timeRange.min);
        time = Math.min(time, timeRange.max);
        time = Math.round(time / 5) * 5;
        d3.select(this).attr('transform',
                                d3.transform().translate(xScale(time),0)
                            );
        let timeChangeEvent = new CustomEvent('time_changed', {year: time});
        document.dispatchEvent(timeChangeEvent);

    }
    let timeLine = g.append('line')
                        .attr('class','timeline')
                        .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2',chartHeight)
                        .attr('transform',
                            d3.transform().translate(xScale(time),0)
                        )
                        .call(dragTimeline);
}