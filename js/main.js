/* javascript sheet mkohls */
//D3 lab

//execute script when window is loaded
window.onload = function(){
    ///svg dimension variables
    var width = 900, height = 500;

    var container = d3.select("body") //get the <body> element from the DOM
        .append("svg") //puts a new svg into the body of the html doc
        .attr("width", width) //assign width
        .attr("height", height) //assign height
        .attr("class", "container") //to use for future styling and selection
        .style("background-color","#FAAEF4"); //semicolon at end of code block

    //new block to add another element
    var insideRect = container.append("rect") //put rectangle inside main container (svg)
        .datum(400)
        .attr("width", function(d){
          return d*2;
        }) //width of rectangle is now based on datum (d) (doesn't have to be called d)
        .attr("height", function(d){
          return d;
        }) //height of rectangle is also a function of datum
        .attr("class", "insideRect") //class name same as variable name
        .attr("x", 50) //horizontal offset
        .attr("y", 50) //vertical offset
        .style("fill","#FCEE94"); //fill in color of rectangle

    var arrayData = [10, 20, 30, 40, 50]; //random array of data

    var countyPop = [  //example population array from module 2
    {
        county: 'Florence',
        population: 4354
    },
    {
        county: 'Bayfield',
        population: 15004
    },
    {
        county: 'Sauk',
        population: 63340
    },
    {
        county: 'Walworth',
        population: 102917
    },
    {
        county: 'Waukesha',
        population: 396731
    }
];

    var x = d3.scaleLinear() //creates linear scale
        .range([90, 750]) //min and max x coordinates
        .domain([0, 4]); //input min and max - ie, number of steps on the scale?
        //scale will generate an output proportional to input, when passed a value

    var minPop = d3.min(countyPop, function(d){
      return d.population; //finds minimum value of population array
    });

    var maxPop = d3.max(countyPop, function(d){
      return d.population; //finds maximum value of array
    });

    var y = d3.scaleLinear()  //create linear scale for vertical axis
        .range([450, 50])
        .domain([0, 500000]);

    var yAxis = d3.axisLeft(y); //generates y axis

    var axis = container.append("g") //g is a group element
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")  //move axis into proper position on screen
        .call(yAxis); //feeds the axis selection to the yAxis generator
        //axis is styled in css because it's static (not dependent on changing data)

    var color = d3.scaleLinear()  //create linear scale to generate color values
        .range([  //range of colors as outputs
          "#92F7DF",
          "#92CFF7"
        ])
        .domain([
          minPop,
          maxPop
        ]);

    var bubbles = container.selectAll(".bubbles") //empty selection of circles that don't yet exist
        .data(countyPop) //feed in data from array
        .enter() //?
        .append("circle")
        .attr("class", "bubbles")
        .attr("id", function(d){
          return d.county; //city attribute from array
        })
        .attr("r", function(d){
          var area = d.population * 0.05; //population attribute from array
          return Math.sqrt(area/Math.PI); //circle radius based on pop value
        })
        .attr("cx", function(d, i){
          return x(i); //circle x position
        })
        .attr("cy", function(d){
          return y(d.population); // circle y position - largest population is highest up in rectangle
        })
        .style("fill",function(d,i){
          return color(d.population); //fill is based on color scale
        })
        .style("stroke", "#FFFFFF");  //white stroke

    var bubbleLabels = container.selectAll(".bubbleLabels") //create label element
        .data(countyPop) //feed in data
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
          return y(d.population) - 60;
        });

    var format = d3.format(","); // generates format for numbers

    var firstLine = bubbleLabels.append("tspan") //break label into two lines - this is the first
        .attr("class", "firstLine")
        .attr("x", function(d, i){
          return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) - 30;
        })
        .attr("dy", 25)
        .text(function(d){
          return d.county;
        });

    var nextLine = bubbleLabels.append("tspan") //this is the second line
        .attr("class", "nextLine")
        .attr("x", function(d, i){
          return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) - 30;
        })
        .attr("dy", 15)
        .text(function(d){
          return "pop. " + format(d.population);
        });

    var chartTitle = container.append("text") // text element
        .attr("class", "title") //the text element will serve as a title
        .attr("text-anchor", "middle") //center the text
        .attr("x", 450) //position it more precisely
        .attr("y", 30)
        .text("Wisconsin County Populations"); //the actual text in the title
};
