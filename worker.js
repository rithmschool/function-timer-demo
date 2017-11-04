importScripts("./functions.js");

onmessage = function(event) {
  var name = event.data.name;
  var input = event.data.input;
  var fn = functions.find(obj => obj.fn.name === name).fn;
  var t1 = performance.now();
  fn(input);
  var t2 = performance.now();
  postMessage({type: "end", time: t2 - t1, name: name});
};