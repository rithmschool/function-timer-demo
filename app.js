var currentFn = null;

document.addEventListener("DOMContentLoaded", function() {
  hljs.initHighlightingOnLoad();

  var data = [];

  setUpFunctions();
  d3.select(".btn-primary").dispatch("click");
  setUpGraph();

  // add event handler
  d3.select("#plot")
    .on("submit", function() {
      d3.event.preventDefault();
      var button = d3.select("#plot > button");
      var calculating = d3.select(".calculating");
      if (!button.classed("disabled")) {
        button.classed("disabled", true);
        calculating.classed("hidden", false);
        var value = +d3.event.target.fn_input.value;
        var worker = createWorker(currentFn.fn.name, value);
        worker.onmessage = function(event) {
          button.classed("disabled", false);
          calculating.classed("hidden", true);
          data.push({
            x: value,
            y: event.data.time,
            name: currentFn.fn.name
          });
          updateGraph(d3.select("svg"), data, currentFn);
        };
      }
    });
});

function setUpFunctions() {
  d3.select(".btn-area")
    .selectAll("button")
    .data(functions)
    .enter()
    .append("button")
      .attr("type", "button")
      .attr("class", d => `btn btn-${d.className}`)
      .html(d => `<pre>${d.fn.name}</pre>`)
      .on("click", setCurrentFunction);
}

function setCurrentFunction(d) {
  currentFn = d;
  var codeBlock = d3.select(".js").text(d.fn.toString());
  hljs.highlightBlock(codeBlock.node());
}

function setUpGraph() {
  var width = document.querySelector(".col-6").offsetWidth - 30;
  var height = width * 3 / 4;
  var padding = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 60
  };

  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .datum({ padding: padding });

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

}

function updateGraph(svg, data, currentFn) {
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var padding = svg.datum().padding;

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
      .attr("r", 5)
      .attr("fill", currentFn.fill)
    .merge(circles)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y / 1000));

}

function createWorker(fn, input) {
  var worker = new Worker("worker.js");
  worker.postMessage({ fn: fn, input: input});
  return worker;
}

// add trend lines (including averages)
// add tooltip to remove points or all function data
// add transitions
// re-style gridlines