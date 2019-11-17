var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;



var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);  

var chosenXAxis = "healthcare";



function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }


  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }



  function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }


  function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "healthcare") {
      var label = "Health Care:";
    }
    else if (chosenXAxis === "smokes"){
      var label = "Smokers:"
    }
    else {
      var label = "Average Age";
    }

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Obesity: ${d.obesity}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

data.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.age=+data.age;
  });


  var xLinearScale = xScale(data, chosenXAxis);


  var yLinearScale = d3.scaleLinear()
    .domain([10, d3.max(data, d => d.obesity)])
    .range([height, 0]);


  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);



  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


    chartGroup.append("g")
    .call(leftAxis);


    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "red")
    .attr("opacity", ".5");

    var textGroup=chartGroup.selectAll(".stateText")
      .data(data)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.obesity))
      .attr("dy", 3)
      .attr("font-size", "10px")
      .text(function(d){return d.abbr});

    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var healthcareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("% of People with Health Care");

    var smokersLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("% of People who Smoke");

    var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Average Age");


    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("% of People who are Obese");


    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    var textGroup = updateToolTip(chosenXAxis, textGroup);

    labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;





        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);


        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        
        


        if (chosenXAxis === "smokes") {
            smokersLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else if (chosenXAxis=== "healthcare") {
            smokersLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
              ageLabel
            .classed("active", false)
            .classed("inactive", true);
          }
          else {
            smokersLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
              ageLabel
            .classed("active", true)
            .classed("inactive", false);

          }
        }
      });
  });