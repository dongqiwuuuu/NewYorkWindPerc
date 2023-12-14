
  const w = 400;
  const h = 300;
  const margin = {top: 25, right: 0, bottom: 25,
      left: 25};
  const innerWidth = w - margin.left - margin.right;
  const innerHeight = h - margin.top - margin.bottom;

  const svg = d3.select("div#plot")
      .attr("width", w)
      .attr("height", h);

// Load the data from the CSV file
d3.csv("https://raw.githubusercontent.com/dongqiwuuuu/NewYorkWindPerc/NY_wind_percip_top5cities.csv").then(function(data) {

  // Filter data for Newark airport
  var newarkData = data.filter(function(d) {
      return d.NAME === "NEWARK LIBERTY INTERNATIONAL AIRPORT, NJ US";
  });

  // Parse the PREC column to float
  newarkData.forEach(function(d) {
      d.PREC = parseFloat(d.PREC);
  });

  // Set the ranges for the scales
  var x = d3.scaleLinear()
      .domain(d3.extent(newarkData, function(d) { return d.PREC; }))
      .range([0, width]);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Set up the histogram generator
  var histogram = d3.histogram()
      .value(function(d) { return d.PREC; })
      .domain(x.domain())
      .thresholds(x.ticks(20));

  // Apply the histogram generator to the data
  var bins = histogram(newarkData);

  // Y axis: scale and draw
  var y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);

  // Append the bars for the histogram
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) {
          return "translate(" + x(d.x0) + "," + y(d.length) + ")";
        })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2");
});
