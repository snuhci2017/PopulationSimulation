/*
format of data is [
    {year: 1928, factor1: 102, factor2: 103},
    ...
]
*/
function draw_factor(data) {
    const svg = d3.select('svg#factor-graph');
    svg.style('width', 700).style('height', 300);
    const charts = svg.append('g');
    const WIDTH = 600;
    const HEIGHT = 200;
    const factorList = ['factor1', 'factor2', 'factor3'];
    const lineData = factorList.map((factorName) => {
        return {
            id: factorName,
            values: data.map((d) => {
                return {
                    year: d.year,
                    value: d[factorName],
                }
            })
        }
    })

    const xScale = d3.scale.linear()
                    .domain([
                        d3.min(data, (d) => (d.year)), d3.max(data, (d) => (d.year))
                    ])
                    .range([0, WIDTH])
    let yScales = {};
    factorList.forEach((id) => {
        yScales[id] = d3.scale.linear()
                        .domain([0, d3.max(data, (d) => (d[id]))])
                        .range([HEIGHT, 0])
    });
    const colorScale = d3.scale.category10().domain(factorList);

    let lines = {};
    factorList.forEach((id) => {
        lines[id] = d3.svg.line().interpolate('cardinal-open')
                        .x((d) => xScale(d.year))
                        .y((d) => yScales[id](d.value));

    });
    console.log(lines);

    let g = svg.append('g')
                .attr('transform', d3.transform().translate(50,10));

    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', d3.transform().translate(0, HEIGHT))
        .call(d3.svg.axis().scale(xScale).orient('bottom'));

    g.append("g")
        .attr("class", "axis axis-y")
        .call(d3.svg.axis().scale(yScales['factor1']).orient('left'));

    let lineChart = g.append('g').attr('class', 'line-chart');

    let factorLine = lineChart.selectAll('.factor-line')
        .data(lineData)
        .enter().append('g').attr('class', 'factor-line');

    factorLine.append('path')
            .attr('class', 'line')
            .attr('d', (d) => lines[d.id](d.values))
            .style('stroke', (d) => colorScale(d.id));

}