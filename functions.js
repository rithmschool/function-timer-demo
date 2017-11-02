// O(n)
function addUpToFirst(n) {
  var total = 0;
  for (var i = 0; i < n; i++) {
    total += i;
  }
  return total;
}

// O(1)
function addUpToSecond(n) {
  return n * (n - 1) / 2;
}

// Other O(n)
function countUpAndDown(n) {

  console.log("Going up!");

  for (var i = 0; i < n; i++) {
    console.log(i);
  }

  console.log("At the top!\nGoing down...");

  for (var j = n - 1; j >= 0; j--) {
    console.log(j);
  }

  console.log("Back down. Bye!");
}

// O(n^2)
function printAllPairs(n) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      console.log(i, j);
    }
  }
}

// O(log(n))
function numberOfHalves(n) {
  var count = 0;
  while (n > 1) {
    n /= 2;
    count++;
  }
  return count;
}

// O(n * log(n))
function totalNumberOfHalves(n) {
  var total = 0;
  for (var i = 0; i < n; i++) {
    total += numberOfHalves(n);
  }
  return total;
}

// O(2^n)
function logAllBinaries(n) {
  var count = 0;
  var lastNum = "1".repeat(n);
  while (count.toString(2) !== lastNum) {
    console.log(count.toString(2).padStart(n, "0"));
    count++;
  }
  console.log(lastNum);
}

var functions = {
  addUpToFirst: addUpToFirst,
  addUpToSecond: addUpToSecond,
  countUpAndDown: countUpAndDown,
  printAllPairs: printAllPairs,
  numberOfHalves: numberOfHalves,
  totalNumberOfHalves: totalNumberOfHalves,
  logAllBinaries: logAllBinaries
};