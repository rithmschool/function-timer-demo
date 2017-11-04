var currentFn = null;

document.addEventListener("DOMContentLoaded", function() {
  var circleData = [];

  hljs.initHighlightingOnLoad();
  setUpFunctions();
  d3.select(".btn-primary").dispatch("click");
  setUpGraph();

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

          circleData.push({
            x: value,
            y: event.data.time,
            color: event.data.color
          });

          updateGraph(
            d3.select("svg"),
            circleData,
            currentFn
          );

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

function updateGraph(svg, circleData, currentFn) {
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var padding = svg.datum().padding;
  var t = d3.transition().duration(1000);
  var tNew = d3.transition()
    .delay(500)
    .duration(1000)
    .ease(d3.easeElasticOut);

  var xScale = d3.scaleLinear()
    .domain(d3.extent(circleData, d => d.x))
    .range([padding.left, width - padding.right]);

  var yScale = d3.scaleLinear()
    .domain(d3.extent(circleData, d => d.y / 1000))
    .range([height - padding.bottom, padding.top]);

  // update axes
  svg
    .select(".x-axis")
    .transition(t)
    .call(
      d3.axisBottom(xScale)
        .tickFormat(d3.format(".2s"))
        .tickSize(-height + padding.top + padding.bottom)
        .tickSizeOuter(0)
    );

  svg
    .select(".y-axis")
    .transition(t)
    .call(
      d3.axisLeft(yScale)
        .tickFormat(d3.format(".2s"))
        .tickSize(-width + padding.left + padding.right)
        .tickSizeOuter(0)
    );

  // update circles
  var circles = svg
    .selectAll("circle")
    .data(circleData);

  circles
    .transition(t)
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y / 1000));

  circles
    .enter()
    .append("circle")
      .attr("fill", d => d.color)
      .attr("r", 0)
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y / 1000))
    .transition(tNew)
      .attr("r", 5);

  // update lines
  var lines = svg
    .selectAll("path.line")
    .data(getLineData(circleData), d => d.key);

  lines
    .enter()
    .append("path")
      .classed("line", true)
      .attr("stroke", d => d.key)
    .merge(lines)
      .transition(t)
      .attr("d", d => d3
        .line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y / 1000))
        (d.value.sort((d1, d2) => d1.x - d2.x))
      );
}

function getLineData(circleData) {
  return d3.nest()
    .key(d => d.color)
    .rollup(points => (
      points.reduce((avgs, pt) => {
        var cur = avgs.find(d => d.x === pt.x);
        if (!cur) avgs.push({
          x: pt.x,
          y: d3.mean(points, d => d.x === pt.x ? d.y : undefined)
        });
        return avgs;
      }, [])
    ))
    .entries(circleData);
}

function createWorker(name, input) {
  var worker = new Worker("worker.js");
  worker.postMessage({ name: name, input: input});
  return worker;
}

// add tooltip to remove points or all function data
