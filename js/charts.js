function toTitleCase(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function drawActivityChart(data_url, xvar, yvar, chartid, from_zero=false) {

    // Set the dimensions of the canvas / graph
    var margin = { top: 30, right: 225, bottom: 60, left: 225 },
        width = 1200 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(10);

    // Define the line
    var valueline = d3.svg.area()
        .x(function (d) { return x(d[xvar]); })
        .y0(y(0))
        .y1(function (d) { return y(d[yvar]); });

    // Adds the svg canvas
    var svg = d3.select(chartid)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.json(data_url, function (error, data) {

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) { return d[xvar]; }));
        // y.domain([0, d3.max(data, function (d) { return d[yvar]; })]);
        if (from_zero) {
            y.domain([0, d3.max(data, function (d) { return d[yvar]; })]);
        }
        else {
            y.domain(d3.extent(data, function (d) { return d[yvar]; }));
        }

        // X axis label
        svg.append("g")
            .append("text")
            .attr("class", "xlabel")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(toTitleCase(xvar));

        // Y axis label:
        svg.append("g")
            .append("text")
            .attr("class", "ylabel")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(90)")
            .attr("y", -width-20)
            .attr("x", 3*margin.top)
            .text(toTitleCase(yvar))

        // Add the valueline path.
        var path = svg.append("path")
            .attr("class", "area")
            .attr("id", yvar)
            .attr("d", valueline(data));

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    });

    var chart = {
        'x': x,
        'y': y,
        'xAxis': xAxis,
        'yAxis': yAxis,
        'data_url': data_url,
        'chartid': chartid,
        'from_zero': from_zero,
    }
    return chart
};

function updateActivityChart(xvar, yvar, chart) {

    // Get the data again
    d3.json(chart.data_url, function (error, data) {

        // Scale the range of the data again 
        chart.x.domain(d3.extent(data, function (d) { return d[xvar]; }));
        if (chart.from_zero) {
            chart.y.domain([0, d3.max(data, function (d) { return d[yvar]; })]);
            var y0 = chart.y(0);
        }
        else {
            console.log(d3.extent(data, function (d) { return d[yvar]; }))
            chart.y.domain(d3.extent(data, function (d) { return d[yvar]; }));
            var y0 = chart.y(chart.y.domain()[0]);
        }

        // Select the section we want to apply our changes to
        var svg = d3.select(chart.chartid).transition();

        // Define the 
        var valueline = d3.svg.area()
            .x(function (d) { return chart.x(d[xvar]); })
            // .y0(chart.y(0))
            .y0(y0)
            .y1(function (d) { return chart.y(d[yvar]); });

        // Make the changes
        svg.select(".area")   // change the line
            .duration(750)
            .attr("d", valueline(data));
        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(chart.xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(chart.yAxis);

        svg.select(".xlabel")
            .text(toTitleCase(xvar));

    });
}

// function journey_chart (url, chartid, type, color, container) {

//     console.log("Creating chart at: " + chartid);
//     var varname = type.toLowerCase();
//     console.log(varname);

//     var chartDiv = document.getElementById(container);
//     var chartWidth = chartDiv.offsetWidth;

//     // set the dimensions and margins of the graph
//     var margin = { top: 10, right: 30, bottom: 30, left: 60 },
//         width = chartWidth - margin.left - margin.right,
//         height = 200 - margin.top - margin.bottom;

//     // append the svg object to the body of the page
//     var svg = d3.select(chartid)
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform",
//             "translate(" + margin.left + "," + margin.top + ")");

//     //Read the data
//     d3.json(url, function (data) {

//         // Add X axis --> it is a date format
//         var x = d3.scaleLinear()
//             .domain(d3.extent(data, function (d) { return +d.time; }))
//             .range([0, width]);
//         svg.append("g")
//             .attr("transform", "translate(0," + height + ")")
//             .call(d3.axisBottom(x));

//         // Add Y axis
//         var y = d3.scaleLinear()
//             .domain([0, d3.max(data, function (d) { return +d[varname]; })])
//             .range([height, 0]);
//         svg.append("g")
//             .call(d3.axisLeft(y));

//         // This allows to find the closest X index of the mouse:
//         var bisect = d3.bisector(function (d) { return d.time; }).left;

//         // Create a rect on top of the svg area: this rectangle recovers mouse position
//         svg
//             .append('rect')
//             .style("fill", "none")
//             .style("pointer-events", "all")
//             .attr('width', width)
//             .attr('height', height)
//             .attr('opacity', 0)
//             .on('mouseover', mouseover)
//             .on('mousemove', mousemove)
//             .on('mouseout', mouseout);

//         // Add the area
//         svg.append("path")
//             .datum(data)
//             .attr("fill", color)
//             .attr("stroke", color)
//             .attr("stroke-width", 1)
//             .attr("opacity", 0.5)
//             .attr("d", d3.area()
//                 .x(function (d) { return x(d.time) })
//                 .y0(y(0))
//                 .y1(function (d) { return y(d[varname]) })
//             )

//         // Add X axis label:
//         svg.append("text")
//             .attr("text-anchor", "end")
//             .attr("x", width)
//             .attr("y", height + margin.top + 20)
//             .text("Time");

//         // Y axis label:
//         svg.append("text")
//             .attr("text-anchor", "end")
//             .attr("transform", "rotate(-90)")
//             .attr("y", -margin.left + 20)
//             .attr("x", -margin.top)
//             .text(type)

//         // Create a rect on top of the svg area: this rectangle recovers mouse position
//         svg
//             .append('rect')
//             .style("fill", "none")
//             .style("pointer-events", "all")
//             .attr('width', width)
//             .attr('height', height)
//             .attr('opacity', 0)
//             .on('mouseover', mouseover)
//             .on('mousemove', mousemove)
//             .on('mouseout', mouseout);

//         // Create the text that travels along the curve of chart
//         var focusText = svg
//             .append('g')
//             .append('text')
//             .style("opacity", 0)
//             .attr("text-anchor", "left")
//             .attr("alignment-baseline", "middle")

//         // Create the circle that travels along the curve of chart
//         var focus = svg
//             .append('g')
//             .append('circle')
//             .style("fill", "none")
//             .attr("stroke", "black")
//             .attr('r', 8.5)
//             .style("opacity", 0)

//         // What happens when the mouse move -> show the annotations at the right positions.
//         function mouseover() {
//             focus.style("opacity", 1)
//             focusText.style("opacity", 1)
//         }

//         function mousemove() {
//             // recover coordinate we need
//             var x0 = x.invert(d3.mouse(this)[0]);
//             var i = bisect(data, x0, 1);
//             selectedData = data[i]
//             focus
//                 .attr("cx", x(selectedData.time))
//                 .attr("cy", y(selectedData[varname]))
//             focusText
//                 .html("Time:" + selectedData.time + "   " + type + ":" + selectedData[varname])
//                 .attr("x", x(selectedData.time) + 15)
//                 .attr("y", y(selectedData[varname]))
//         }
//         function mouseout() {
//             focus.style("opacity", 0)
//             focusText.style("opacity", 0)
//         }

//     })

// }