var currentFn = null;
var currentCirc = null;
var radius = 5;
var hoverRadius = 8;
var circleData = [];
var tHover = d3
  .transition()
  .duration(500)
  .ease(d3.easeLinear);

document.addEventListener("DOMContentLoaded", function() {
  hljs.initHighlightingOnLoad();
  setUpFunctions();
  d3.select(".btn").dispatch("click");
  setUpGraph();

  d3.select("#plot").on("submit", function() {
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

        updateGraph(d3.select("svg"), circleData, currentFn);
      };
    }
  });

  d3.select("body").on("keydown", function() {
    if (currentCirc) {
      handleXAdd();
    }
  });

  d3.select("body").on("keyup", function() {
    handleXRemove();
  });
});

function setUpFunctions() {
  d3
    .select(".btn-area")
    .selectAll("button")
    .data(functions)
    .enter()
    .append("button")
    .attr("type", "button")
    .classed("btn", true)
    .style("background-color", d => d.color)
    .style("border-color", d => d.color)
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

  var svg = d3
    .select("svg")
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
    .attr(
      "transform",
      "translate(" + width / 2 + ", " + (height - padding.bottom / 4) + ")"
    )
    .text("n");

  svg
    .append("text")
    .classed("label", true)
    .attr("transform", "rotate(-90)")
    .attr("x", (-height + padding.top + padding.bottom) / 2)
    .attr("y", 15)
    .text("Time Elapsed (seconds)");
}

function updateGraph(svg, circleData, currentFn) {
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var padding = svg.datum().padding;
  var t = d3.transition().duration(1000);
  var tNew = d3
    .transition()
    .delay(500)
    .duration(1000)
    .ease(d3.easeElasticOut);

  var xScale = d3
    .scaleLinear()
    .domain(d3.extent(circleData, d => d.x))
    .range([padding.left, width - padding.right]);

  var yScale = d3
    .scaleLinear()
    .domain(d3.extent(circleData, d => d.y / 1000))
    .range([height - padding.bottom, padding.top]);

  // update axes
  svg
    .select(".x-axis")
    .transition(t)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat(d3.format(".2s"))
        .tickSize(-height + padding.top + padding.bottom)
        .tickSizeOuter(0)
    );

  svg
    .select(".y-axis")
    .transition(t)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(d3.format(".2s"))
        .tickSize(-width + padding.left + padding.right)
        .tickSizeOuter(0)
    );

  // update circles
  var circles = svg
    .selectAll("circle")
    .data(circleData, d => `${d.x}-${d.y}-${d.color}`);

  circles.exit().remove();

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
    .on("mousemove", handleHover)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick)
    .transition(tNew)
    .attr("r", radius);

  // update lines
  var lines = svg
    .selectAll("path.line")
    .data(getLineData(circleData), d => d.key);

  lines.exit().remove();

  lines
    .enter()
    .append("path")
    .classed("line", true)
    .attr("stroke", d => d.key)
    .merge(lines)
    .transition(t)
    .attr("d", d =>
      d3
        .line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y / 1000))(d.value.sort((d1, d2) => d1.x - d2.x))
    );
}

function handleHover(d) {
  currentCirc = d3.select(this);
  currentCirc
    .interrupt()
    .transition(tHover)
    .attr("r", hoverRadius);

  handleXAdd();
}

function handleMouseOut(d) {
  currentCirc = null;
  d3
    .selectAll("circle")
    .interrupt()
    .transition(tHover)
    .attr("r", radius);

  handleXRemove();
}

function handleClick() {
  var selection;
  if (d3.event.metaKey) selection = currentCirc;
  if (d3.event.shiftKey)
    selection = d3.selectAll(`circle[fill="${currentCirc.attr("fill")}"]`);
  if (selection) {
    var data = selection.data();
    data.forEach(d => {
      var idx = circleData.findIndex(c => c === d);
      circleData.splice(idx, 1);
    });
    updateGraph(d3.select("svg"), circleData, currentFn);
  }
  currentCirc = null;
  handleXRemove();
}

function handleXAdd() {
  var selection;
  if (d3.event.metaKey) selection = currentCirc;
  if (d3.event.shiftKey)
    selection = d3.selectAll(`circle[fill="${currentCirc.attr("fill")}"]`);
  if (selection) {
    selection.each(function(d, i) {
      var circle = d3.select(this);
      var newX = d3
        .select("svg")
        .append("g")
        .classed("circle-remove", true);
      var stroke = circle.attr("fill") === "#dc3545" ? "#343a40" : "#dc3545";
      newX
        .append("line")
        .attr("x1", +circle.attr("cx") - hoverRadius)
        .attr("x2", +circle.attr("cx") + hoverRadius)
        .attr("y1", +circle.attr("cy") + hoverRadius)
        .attr("y2", +circle.attr("cy") - hoverRadius)
        .attr("stroke", stroke)
        .attr("stroke-width", hoverRadius / 3);
      newX
        .append("line")
        .attr("x1", +circle.attr("cx") - hoverRadius)
        .attr("x2", +circle.attr("cx") + hoverRadius)
        .attr("y1", +circle.attr("cy") - hoverRadius)
        .attr("y2", +circle.attr("cy") + hoverRadius)
        .attr("stroke", stroke)
        .attr("stroke-width", hoverRadius / 3);
      newX
        .interrupt()
        .transition(tHover)
        .style("opacity", 1);
    });
  }
}

function handleXRemove() {
  var e = d3.event;
  var isMouseOut = e.type === "mouseout";
  var isClick = e.type === "click";
  var metaOff = e.type === "keyup" && !e.metaKey;
  var shiftOff = e.type === "keyup" && !e.shiftKey;
  if (isMouseOut || isClick || shiftOff) {
    d3
      .selectAll(".circle-remove")
      .interrupt()
      .transition(tHover)
      .style("opacity", 0)
      .remove();
  }
  if (!metaOff && !isClick) handleXAdd();
}

function getLineData(circleData) {
  return d3
    .nest()
    .key(d => d.color)
    .rollup(points =>
      points.reduce((avgs, pt) => {
        var cur = avgs.find(d => d.x === pt.x);
        if (!cur)
          avgs.push({
            x: pt.x,
            y: d3.mean(points, d => (d.x === pt.x ? d.y : undefined))
          });
        return avgs;
      }, [])
    )
    .entries(circleData);
}

function createWorker(name, input) {
  var worker = new Worker("worker.js");
  worker.postMessage({ name: name, input: input });
  return worker;
}
