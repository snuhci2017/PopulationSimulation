/*
format of data is [
    {year: 1928, factor1: 102, factor2: 103},
    ...
]
*/

const HousingPrice = 'housing price';
const MarriageAge = 'marriage age';
const EducationRate = 'education rate';
const FemaleEconomicRate = 'female economic rate';


var factorValue = {
    [HousingPrice]: 110.0,
    [MarriageAge]: 36.0,
    [EducationRate]: 14.0,
    [FemaleEconomicRate]: 53,
};

const rangeForFactor = {
    [HousingPrice]: {
        max: 150, min: 20
    },
    [MarriageAge]: {
        max: 40, min: 15
    },
    [EducationRate]: {
        max: 14, min: 0
    },
    [FemaleEconomicRate]: {
        max: 60, min: 48
    }
}

const nameForFactor = {
    [HousingPrice] : '집값',
    [MarriageAge] : '초혼연령',
    [EducationRate] : '교육비 지출비중',
    [FemaleEconomicRate] : '여성 경제 참여율'
}

const unitForFactor = {
    [HousingPrice] : '2016.05 : 100%',
    [MarriageAge] : '',
    [EducationRate] : '[%]',
    [FemaleEconomicRate] : '[%]'
}

var selectedFactor = MarriageAge;
const factorList = [MarriageAge, HousingPrice, EducationRate, FemaleEconomicRate];
var selectedTime = [{time: inityear}];
var secondSelectedTime = {time: curryear};

var isFactorEmitting = false;
var isFactorChanged = false;

function loadFactor() {
    d3.queue()
        .defer(d3.csv, "data/economic female rate.csv")
        .defer(d3.csv, "data/education rate.csv")
        .defer(d3.csv, "data/factor_housing_price.csv")
        .defer(d3.csv, "data/marriage age.csv")
        .await(function(error, file1, file2, file3, file4) {
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
            loadOneFactor(FemaleEconomicRate, file1);
            loadOneFactor(EducationRate, file2);
            loadOneFactor(HousingPrice, file3);
            loadOneFactor(MarriageAge, file4);
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
        left: 50, right: 150, top: 20, bottom: 30
    }
    const containerWidth = $('#factor-container').width();
    const containerHeight = $('#factor-container').height();
    const chartWidth = containerWidth - svgMargin.x * 2 - chartMargin.left - chartMargin.right;
    const chartHeight = containerHeight - svgMargin.y * 2 - chartMargin.top - chartMargin.bottom;
    svg.style('width', containerWidth - svgMargin.x * 2).style('height', containerHeight - svgMargin.y * 2);
    const maxYear = endyear;
    const timeRange = {max: maxYear - 10, min: startyear};

    const xScale = d3.scale.linear()
                    .domain([startyear - 5, maxYear])
                    .range([0, chartWidth])

    let yScales = {};
    factorList.forEach((id) => {
        yScales[id] = d3.scale.linear()
                        .domain([rangeForFactor[id].min, rangeForFactor[id].max])
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

    let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickSize(6)
        .ticks((endyear - startyear) / 10 + 1)
        .tickFormat(d3.format('d'));

    g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', d3.transform().translate(0, chartHeight))
        .call(xAxis);

    g.append("g")
        .attr("class", "axis axis-y")
        .call(d3.svg.axis().scale(yScales[selectedFactor]).orient('left').ticks(5));
    g.append('text')
        .text('[%]')
        .attr('class', 'axis-y-unit')
        .attr('text-anchor', 'middle')
        .attr('transform', d3.transform()
            .translate([0,-10])
        )
        .attr('font-size', '12px');

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

    //MARK: future area
    let futureAreaWidth = xScale(maxYear) - xScale(2017);
    let futureArea = g.append('g')
        .attr('class', 'future-area')
        .attr('transform', d3.transform().translate([xScale(2017), chartHeight]));
    futureArea.append('rect')
        .attr('height', 35).attr('width', xScale(maxYear) - xScale(2017) + 10).attr('y', -10);
    futureArea.append('text')
        .attr('class', 'future-area-desc')
        .text('시뮬레이션 영역')
        .attr('transform', d3.transform().translate([futureAreaWidth + 20,10]));


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
            .text((d) => nameForFactor[d]);
    }

    var FactorHandleEnter = handleContainer.selectAll('.factor-handle').data(factorList)
        .enter();

    FactorHandleEnter.append('circle')
        .on('mousedown',(d) => {
            selectedFactor = d;
            updateFocused();
        })
        .call(setFactorHandle)
        .call(dragFactor);
    FactorHandleEnter.append('text')
        .attr('class', 'factor-handle-value')
        .call(setFactorHandleValue);

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

    function setFactorHandleValue(selection) {
        selection
            .attr('transform', d3.transform()
                .translate((d) => [xScale(maxYear) - 15, yScales[d](factorValue[d])])
            )
            .attr('text-anchor', 'end')
            .text((d) => factorValue[d].toFixed(2))
            .attr('display', (d) => (d === selectedFactor ? 'auto' : 'none'))
    }

    function updateFactorHandleValue() {
        d3.selectAll('.factor-handle-value').call(setFactorHandleValue);
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

        updateTimeline();
        updateFactorHandleValue();
        emitFactorEvent();
    }

    function updateFocused() {
        if (selectedFactor === null) {
            g.select('.axis-y').attr('opacity', 0);
        } else {
            g.select('.axis-y').call(d3.svg.axis().scale(yScales[selectedFactor]).orient('left').ticks(5)).attr('opacity',1);
            g.select('.axis-y-unit').text(unitForFactor[selectedFactor]);
        }

        factorList.forEach((name) => {
            let $p = $('#factor-nav-container p[factorId=\'' + name + '\']');
            if (name === selectedFactor) {
                $p.show();
            } else {
                $p.hide();
            }
        });

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
        updateFactorHandleValue();
        updateTimeline();
    }

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
        d3.select(this).select('.factor-value').call(setFactorValue);
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

    function emitFactorEvent() {
        if (isFactorEmitting) {
            isFactorChanged = true;
            return;
        }
        _emitFactorEvent();
    }

    function _emitFactorEvent() {
        console.log("EmitFactor");
        isFactorChanged = false;
        isFactorEmitting = true;
        let ret = {};
        factorList.forEach((factorName) => {
            let values = data[factorName].values;
            let lastValueItem = values[values.length - 1];
            let lastYear = lastValueItem.year;
            let lastValue = lastValueItem.value;
            let nextYear = maxYear;
            let nextValue = factorValue[factorName];
            let a = (nextValue - lastValue) / (nextYear - lastYear);
            let b = nextValue - a * nextYear;
            ret[factorName] = {a, b, lastYear};
        });
        let factorChangeEvent = new CustomEvent('factor_changed', {'detail': ret});
        document.dispatchEvent(factorChangeEvent);
        setTimeout(() => {
            if (isFactorChanged) {
                _emitFactorEvent();
                return;
            }
            isFactorEmitting = false;
        }, 1000 / 15);
    }

    emitFactorEvent();

    function modeChangedEvent(numYear) {
        if (numYear === selectedTime.length) return;
        if (numYear === 1) {
            secondSelectedTime = selectedTime[1];
            selectedTime.splice(1,1);
            updateTimeline();
            emitTimelineEvent(0);
        } else { // numYear === 2
            let secondTime = secondSelectedTime.time;
            if (secondTime < selectedTime[0].time)
                selectedTime.splice(0,0, {time: secondTime});
            else
                selectedTime.splice(1,0, {time: secondTime});
            updateTimeline();
            emitTimelineEvent(0);
            emitTimelineEvent(1);
        }
    }
    factorEvents.modeChangedEvent = modeChangedEvent;

    function getFactor(time,name) {
        let factorData = lineData.filter((d) => {
            return d.id === name;
        });
        if (factorData.length !== 1) {
            return null;
        }
        factorData = factorData[0].values;
        let upperBound = factorData.filter((d) => {
            return d.year >= time;
        });
        let lowerBound = factorData.filter((d) => {
            return d.year <= time;
        });
        if (lowerBound.length === 0) return null;
        upperBound = upperBound[0];
        lowerBound = lowerBound[lowerBound.length - 1];
        if (upperBound.year === lowerBound.year) {
            return upperBound.value;
        }
        let t =  (time - lowerBound.year) / (upperBound.year - lowerBound.year);
        let ret = Lerp(lowerBound.value, upperBound.value, t);
        return ret;
    }

    function Lerp(from,to,t) {
        return from * (1-t) + to * t;
    }

    function updateTimeline() {
        let timeLine = g.selectAll('.timeline')
                        .data(selectedTime);

        timeLine
            .attr('transform', d3.transform()
                .translate((d) => [xScale(d.time),0])
            );

        timeLine.select('.factor-value').call(setFactorValue);

        let timeLineEnter = timeLine
                                .enter()
                                    .append('g')
                                        .attr('class', 'timeline')
                                        .attr('transform',
                                            d3.transform().translate((d) => [xScale(d.time),0])
                                        )
                                        .call(dragTimeline);

        timeLineEnter.append('line')
                .attr('x1', 0).attr('x2', 0).attr('y1', -10).attr('y2',chartHeight);
        timeLineEnter.append('rect')
                .attr('width', 20).attr('height', chartHeight+10).attr('x', -10).attr('y', -10);
        timeLineEnter.append('text')
                .call(setFactorValue);

        timeLine.exit()
            .transition()
                .style('opacity', 0)
                .remove();
    }

    function setFactorValue(selection) {
        selection.attr('class', 'factor-value')
                .text((d) => {
                    let factor = getFactor(d.time, selectedFactor);
                    if (factor === null) {
                        return '';
                    } else {
                        return factor.toFixed(2);
                    }
                })
                .attr('transform', d3.transform().translate((d) => {
                    let factor = getFactor(d.time, selectedFactor);
                    if (factor === null) return [0,0];
                    return [-5, yScales[selectedFactor](factor)];
                }))
                .attr('text-anchor', 'end');
    }

    updateTimeline();

    updateFocused();

}

var factorEvents = {};
