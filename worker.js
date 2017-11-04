importScripts("./functions.js");

onmessage = function(event) {
  var name = event.data.name;
  var input = event.data.input;
  var fnData = functions.find(obj => obj.fn.name === name);
  var t1 = performance.now();
  fnData.fn(input);
  var t2 = performance.now();
  postMessage({type: "end", time: t2 - t1, color: fnData.color});
};