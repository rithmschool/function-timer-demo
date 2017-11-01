document.addEventListener("DOMContentLoaded", function() {
  hljs.initHighlightingOnLoad();

  var codeArea = document.querySelector(".js");
  codeArea.innerText = addUpTo.toString();
});

function addUpTo(n) {
  var total = 0;
  for (var i = 0; i <= n; i++) {
    total += n;
  }
  return total;
}