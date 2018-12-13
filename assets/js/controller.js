(function() {
  // Data points
  var points = [[1,1],[2,3],[3,2],[4,4],[5,6],[6,5],[7,4],[8,7],[9,9]];
  // Regression coefficients
  var a = 1, b = 0;
  // Factor for the display
  var aFact = 2;
  var bFact = 5;
  var max, min;

  // List for saved coefficients
  var savedPoints = [];

  // Color scale for the hypothesis space heatmap
  var color = d3.scale.linear().domain([0, 15, 62])
  .range(['rgb(250,250,60)', 'rgb(50,190,175)', 'rgb(62,54,165)']);

  // Scales for the points
  var x = d3.scale.linear().domain([0,10]).range([0,500]);
  var y = d3.scale.linear().domain([0,10]).range([500,0]);

  // Colors for saved coefficients
  var colors = ["red", "green", "blue", "orange", "purple"];

  function init() {
    var plot = d3.select("#plot");

    // Lines for representing the error
    plot.selectAll("line").data(points)
      .enter().append("line")
      .attr("stroke", "orangered");

    // Draw data points
    plot.selectAll("circle").data(points)
      .enter().append("circle")
      .attr("cx", d => x(d[0]))
      .attr("cy", d => y(d[1]))
      .attr("r", 5)
      .attr("fill", "black");

    // Path for the line that is moved by moving the mouse on the heatmap
    plot.append("path")
      .attr("class", "pl")
      .attr("fill", "none")
      .attr("stroke", "black");

    // When the user clicks on the heatmap, the coefficients are saved
    d3.select("#canvas").on("click", function() {
      savedPoints.push([a, b]);
      drawFitness();
      draw();
    });

    // When the mouse is moved over the heatmap, the coefficients are updated
    d3.select("#canvas").on("mousemove", function() {
      var mouse = d3.mouse(this);
      a = (mouse[0]-250) / 250 * aFact;
      b = (250 - mouse[1]) / 250 * bFact;
      draw();
    });
  }

  function draw() {
    var plot = d3.select("#plot");

    var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d[0]); })
      .y(function(d) { return y(d[1]); });

    // Update the regression line
    plot.select("path.pl").attr("d", line(getPoints(a, b)));

    // Draw error lines
    plot.selectAll("line").data(points)
    .attr("x1", d => x(d[0]))
    .attr("y1", d => y(d[1]))
    .attr("x2", d => x(d[0]))
    .attr("y2", d => y(abLine(d[0], a, b)));

    // Draw lines for saved coefficients
    var saved = savedPoints.map(p => getPoints(p[0], p[1]));
    var savedPlt = plot.selectAll("path.saved").data(saved);
    savedPlt.enter()
      .append("path")
      .attr("class", "saved")
      .attr("d", (d) => line(d))
      .attr("stroke", (d,i) => colors[i])
      .attr("stroke-width", 3)
      .attr("opacity", 0.7)
      .attr("fill", "transparent");

    // Update status text
    d3.select(".abText").text(`a: ${Math.round(a * 100) / 100},
                              b: ${Math.round(b * 100) / 100},
                              f: ${Math.round(fitness(a,b) * 100) / 100}`);
  }

  // Calculates the line. Could be made simpler, since it is only a line,
  // but this supports various functions instead of only linear regression.
  function getPoints(a, b) {
    var pt = [];
    for (var i = 0; i < 10; i += 0.5) {
      pt.push([i, abLine(i, a, b)]);
    }
    return pt;
  }

  // Draw heatmap of fitness values/cost function
  function drawFitness() {
    var e = document.getElementById("canvas");
    var ctx = e.getContext("2d");
    min = Number.POSITIVE_INFINITY;
    max = 0;
    for (var s = 0; s < 500; s++) {
      var a = (s - 250) / 250 * aFact;
      for (var w = 0; w < 500; w++) {
        var b = (w - 250) / 250 * bFact;

        var f = fitness(a, b);
        min = Math.min(min, f);
        max = Math.max(max, f);
        ctx.fillStyle = color(f);
        ctx.fillRect(s,500-w,1,1);
      }
    }
    // Draw points where the saved coefficients are
    for (var i = 0; i < savedPoints.length; i++) {
      var pt = savedPoints[i];
      var x = pt[0] / aFact * 250 + 250;
      var y = 500 - (pt[1] / bFact * 250 + 250);

      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }
  }

  // Fitness function (RMSE)
  function fitness(a, b) {
    var sum = 0;
    for(var i = 0; i < points.length; i++) {
      sum += Math.pow(abLine(points[i][0], a, b) - points[i][1], 2);
    }
    return Math.sqrt(sum);
  }

  // Line function
  function abLine(x, a, b) {
    return a*x + b;
  }

  init();
  drawFitness();
  draw();
})();
