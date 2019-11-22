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



var chart = d3
  .select("#scatter")
  .append("div")
  .classed("chart", true);

var svg = chart.append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);  

var chosenXAxis = "healthcare";
var chosenYAxis = "obesity";


function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

  function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2])
      .range([height, 0]);
  
    return yLinearScale;
  
  }


  function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }



  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){
    textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
  }

  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "healthcare") {
      var xlabel = "Lacks Healthcare:";
    }
    else if (chosenXAxis === "smokes"){
      var xlabel = "Smokers:"
    }
    else {
      var xlabel = "Median Age";
    }

    if (chosenYAxis === "obesity") {
      var yLabel = "Obesity:"
    }
    else if (chosenYAxis === "poverty"){
      var yLabel = "Poverty: "
    }
    else {
      var yLabel = "Income:"
    }

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br> ${yLabel}${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
  
    .on("mouseout", function(data) {
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
    data.poverty =+data.poverty;
    data.income=+data.income;
  });


  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);


  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);



  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);


    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", ".5");

    var textGroup=chartGroup.selectAll(".stateText")
      .data(data)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("dy", 3)
      .attr("font-size", "10px")
      .text(function(d){return d.abbr});

    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var healthcareLabel = xlabelsGroup.append("text")
    .classed("aText", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "healthcare")
    .classed("active", true)
    .text("% of People who Lack Health Care");

    var smokersLabel = xlabelsGroup.append("text")
    .classed ("aText", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("% of People who Smoke");

    var ageLabel = xlabelsGroup.append("text")
    .classed ("aText", true)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Median Age");

    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

      var obesityLabel = yLabelsGroup.append("text")
      .classed("aText", true)
      .classed("active", true)
      .attr("x", 0)
      .attr("y", 0 - 80)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "obesity")
      .text("% of People who are Obese");

      var incomeLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "income")
        .text("Median Household Income");
    
      var povertyLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "poverty")
        .text("% of People in Poverty");


    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  

    xlabelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {

  
        chosenXAxis = value;

        xLinearScale = xScale(data, chosenXAxis);

      
        xAxis = renderAxesX(xLinearScale, xAxis);

      
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


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
      yLabelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
    
          chosenYAxis = value;
  
          yLinearScale = yScale(data, chosenYAxis);
  
        
          yAxis = renderAxesY(yLinearScale, yAxis);
  
        
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
  
          if (chosenYAxis === "obesity") {
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
              povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            }
            else if (chosenYAxis=== "income") {
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
              povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            }
            else {
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
              povertyLabel
              .classed("active", true)
              .classed("inactive", false);
  
            }
          }
        }); 
  });