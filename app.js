var width, height;
var padding = {
  top: 10,
  right: 10,
  bottom: 40,
  left: 60
};

document.addEventListener("DOMContentLoaded", function() {
  hljs.initHighlightingOnLoad();
  var currentFn = addUpTo;
  var data = [];
  var codeArea = document.querySelector(".js");
  codeArea.innerText = addUpTo.toString();

  width = document.querySelector(".col-6").offsetWidth - 30;
  height = width * 3 / 4;

  // set up SVG and axes
  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("g")
    .attr("transform", "translate(0, " + (height - padding.bottom) + ")")
    .classed("x-axis", true);

  svg
    .append("g")
    .attr("transform", "translate(" + padding.left + ", 0)")
    .classed("y-axis", true);

  svg
    .append("text")
    .classed("label", true)
    .attr("transform", "translate(" + (width / 2) + ", " + (height - padding.bottom / 4) +")")
    .text("n");

  svg
    .append("text")
    .classed("label", true)
    .attr("transform", "rotate(-90)")
    .attr("x", (-height + padding.top + padding.bottom ) / 2)
    .attr("y", 15)
    .text("Time Elapsed (seconds)");

  // add event handler
  d3.select("#plot")
    .on("submit", function() {
      d3.event.preventDefault();
      var value = +d3.event.target.fn_input.value;
      data.push({
        x: value,
        y: time(currentFn, value),
        name: currentFn.name
      });
      updateGraph(svg, data);
    });
});

function time(fn, input) {
  var t1 = performance.now();
  fn(input);
  var t2 = performance.now();
  return t2 - t1;
}

function updateGraph(svg, data) {

  var xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([padding.left, width - padding.right]);

  var yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y / 1000))
    .range([height - padding.bottom, padding.top]);

  svg
    .select(".x-axis")
    .call(
      d3.axisBottom(xScale)
        .tickFormat(d3.format(".2s"))
    );

  svg
    .select(".y-axis")
    .call(
      d3.axisLeft(yScale)
        .tickFormat(d3.format(".2s"))
    );

  var circles = svg
    .selectAll("circle")
    .data(data);

  circles
    .enter()
    .append("circle")
      .attr("r", d => 5)
    .merge(circles)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y / 1000));

}
