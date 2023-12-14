
// Set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 50, left: 60},  // Adjusted margins to accommodate labels
    width = 560 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select("div#plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// Load the data from the CSV file

// Define month names for labeling
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"];

// Parse the date / time
  var parseTime = d3.timeParse("%Y-%m-%d");
d3.csv("https://raw.githubusercontent.com/dongqiwuuuu/NewYorkWindPerc/main/NWK_AWND.csv").then(function(data) {

  // Parse dates and AWND
  data.forEach(function(d) {
    d.DATE = parseTime(d.DATE);
    d.AWND = +d.AWND;
  });

  // Filter out entries without wind data
  data = data.filter(function(d) {
    return !isNaN(d.AWND) && d.AWND !== 0;
  });

  // Generate a histogram using twenty uniformly-spaced bins.
  var xScale = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.AWND; }))
      .range([0, width]);

  var histogram = d3.histogram()
      .value(function(d) { return d.AWND; })
      .domain(xScale.domain())
      .thresholds(xScale.ticks(20));

  var bins = histogram(data);

  // Y axis: scale and draw
  var yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(bins, function(d) { return d.length; })]);

  // Append the bar rectangles to the svg element
  var bars = svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
          return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")";
        })
        .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 1; })
        .attr("height", function(d) { return height - yScale(d.length); })
        .style("fill", "#69b3a2");

  // Add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
    .append("text")
      .attr("fill", "#000")
      .attr("x", width / 2)
      .attr("y", 35) // Adjust the position as needed
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .text("Wind Speed");

  // Add the y Axis
  svg.append("g")
      .call(d3.axisLeft(yScale))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -40) // Adjust the position as needed
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Frequency");

  // Add a label for the current month
  var monthLabel = svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .style("font-size", "16px");

  // Function to update the histogram
  function updateHistogram(month) {
    // Filter data to the specific month
    var monthlyData = data.filter(function(d) {
      return d.DATE.getMonth() === month;
    });

    // Recompute histogram with new data
    var monthlyBins = histogram(monthlyData);

    // Recalculate yScale domain based on new data
    yScale.domain([0, d3.max(monthlyBins, function(d) { return d.length; })]);

    // Select the bars and join with new data
    bars.data(monthlyBins);

    // Update all bars to new positions
    bars.transition()
      .duration(1000)
      .attr("transform", function(d) {
        return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")";
      })
      .attr("height", function(d) { return height - yScale(d.length); });

    // Update the month label
    monthLabel.text(monthNames[month]);
  }

  // Initial histogram for January
  updateHistogram(0); // January is month 0 in JavaScript

  // Update the histogram to the next month every 2 seconds
  var currentMonth = 0;
  setInterval(function() {
    currentMonth = (currentMonth + 1) % 10; // Loop from January to October (0 to 9)
    updateHistogram(currentMonth);
  }, 2000);


});
