//width and height
const margin = { top: 50, right: 50, bottom: 50, left: 50 }
    , w = 1200 - margin.left - margin.right // Use the window's width 
    , h = 800 - margin.top - margin.bottom // Use the window's height
var padding = 40;


var dataset;
//load data
d3.csv('../data/gapminder.csv').then(function (data) {

    filt_data = data.filter(d => d['fertility'] != "NA");
    filt_data = data.filter(d => d['life_expectancy'] != "NA");
    filt_data = data.filter(d => d['year'] == 1980);

    //scale function
    let xScale = d3.scaleLinear()
        .domain([0.8, 9])
        .range([padding, w - padding * 2]);

    let yScale = d3.scaleLinear()
        .domain([20, 80]) //d3.max(data, function (d) { return d['life_expectancy']; })
        .range([h - padding, padding]);

    //create svg element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    //tooltip element
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', '#f0f3f7')


    //line grapph for within tooltip elem
    const tooltipSvg = div.append("svg")
        .attr("id", "ttLineGraph")
        .attr('width', 350)
        .attr('height', 300)

    // make x axis
    const xAxis = svg.append("g")
        .attr("transform", "translate(10," + (h - padding) + ")")
        .call(d3.axisBottom(xScale))

    // make y axis
    const yAxis = svg.append("g")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(yScale))

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(" + 20 + "," + 350 + ")rotate(-90)")
        .text('Life Expectancy')

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(" + 560 + "," + 696 + ")")
        .text('Fertility Rate')

    //add dots
    svg.selectAll("circles")
        .data(filt_data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d['fertility']);
        })
        .attr("cy", function (d) {
            return yScale(d['life_expectancy']);
        })
        .attr("r", 5)
        .attr('fill', 'white')
        .style("stroke", "steelblue")
        .on("mouseover", function (x) {

            d3.select(this).style('fill', 'orange')

            //restore width/height to tooltip
            d3.select('#ttLineGraph').attr('width', '350')
            d3.select('#ttLineGraph').attr('height', '300')

            let min;
            let max;

            let countryNow = x.country;
            let filt_data2 = data.filter(d => d.country == countryNow);

            //get min and max for tooltip y axis
            minMaxY = filt_data2.filter(r => r['population'] != "NA");
            minMaxY = minMaxY.map(r => parseInt(r['population']));
            minMaxY = d3.extent(minMaxY);

            min = minMaxY[0];
            max = minMaxY[1];

            //scale function for tooltip
            let xScaleTT = d3.scaleLinear()
                .domain([1960, 2010])
                .range([0, 250]);

            let yScaleTT =
                d3.scaleLinear()
                    .domain([min, max]) //d3.max(data, function (d) { return d['life_expectancy']; })
                    .range([300 - padding, padding]);

            //d3's line generator
            const line = d3.line()
                .x(d => xScaleTT(d['year']) + padding) // set the x values for the line generator
                .y(d => yScaleTT(d['population'])) // set the y values for the line generator 

            tooltipSvg.append('path')
                .datum(filt_data2)
                .attr("d", function (d) { return line(d) })
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", "2px")

            let xAxis2 = tooltipSvg.append("g")
                .attr("transform", "translate(50," + (260) + ")")
                .call(d3.axisBottom(xScaleTT).tickFormat(d3.format("d")).ticks(5))

            let yAxis2 = tooltipSvg.append("g")
                .attr("transform", "translate(" + 50 + ",0)")
                .call(d3.axisLeft(yScaleTT).tickFormat(d3.format(".2s")))

            tooltipSvg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', "translate(" + 12 + "," + 150 + ")rotate(-90)")
                .text('population')
                .style('font-size', '12px')

            tooltipSvg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', "translate(" + 160 + "," + 25 + ")")
                .text(countryNow)
                .style('font-size', '14px')

            tooltipSvg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', "translate(" + 160 + "," + 290 + ")")
                .text('year')
                .style('font-size', '12px')

            div.transition()
                .duration(100)
                .style('opacity', 1)
                .style('left', (d3.event.pageX) + "px")
                .style('top', (d3.event.pageY + 20) + "px")
        })
        .on("mouseout", function (d) {

            d3.select(this).style("fill", "white")

            d3.select('#ttLineGraph')
                .attr('width', '0')
                .attr('height', '0')
                .attr('margin', '0')

            d3.select('#ttLineGraph').selectAll('path').remove();
            d3.select('#ttLineGraph').selectAll('g').remove();
            d3.select('#ttLineGraph').selectAll('text').remove();

            div.transition()
                .style('opacity', '0')
        });

    let filTest = data.filter(d => d['year'] == 1980 && +d['population'] >= 100000000)

    svg.selectAll('.text')
        .data(filTest)
        .enter()
        .append('text')
        .text(d => d.country)
        .attr('x', d => xScale(+d['fertility']) + 20)
        .attr('y', d => yScale(+d['life_expectancy']) + 4)
});

