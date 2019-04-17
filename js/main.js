/* javascript sheet mkohls */
//D3 lab

//anonymous function to keep everything local
(function(){

  //variables for data join
 var attArray = ["forest_land", "timber_land", "live_trees", "dead_trees", "carbon_live"];
 var expressed = attArray[0]; //initial attribute

 //chart frame dimensions
var chartWidth = window.innerWidth * 0.38,
    chartHeight = 600,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scaleLinear()
    .range([0, chartHeight])
    .domain([0, 350000]);

//when window loads, start running script
window.onload = setMap();

//set up choropleth with setMap function
function setMap(){
//map dimensions
  var width = window.innerWidth * 0.56,
      height = 600;

  //create a container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

  //set up projection: Albers equal area for usa
  var projection = d3.geoAlbers()
      .center([0, 38.5])
      .rotate([98, 0, 0])
      .parallels([29, 45.5])
      .scale(900)
      .translate([width/2, height/2]);

  //create a path generator
  var path = d3.geoPath()
      .projection(projection);

  //use Promise to make the data load in parallel
  var promises = [];
  promises.push(d3.csv("data/state_data.csv")); //load csv with data attributes for each state
  promises.push(d3.json("data/contiguous_US.topojson")); //load background spatial data
  promises.push(d3.json("data/FIA_states.topojson")); //load choropleth spatial data
  Promise.all(promises).then(callback);

  //function to call back to setMap and to prepare some variables
  function callback(data){
    forestData = data[0];
    contig = data[1];
    forests = data[2];

//set the graticule
    setGraticule(map, path);

//translate topojsons
    var contigUS = topojson.feature(contig, contig.objects.contiguous_US),
        forestStates = topojson.feature(forests, forests.objects.FIA_states).features;

//add states to map
    var states = map.append("path")
        .datum(contigUS)
        .attr("class", "states")
        .attr("d", path);

    //join csv data to GeoJSON enumeration units
    forestStates = joinData(forestStates, forestData);

//create color scale
    var colorScale = makeColorScale(forestData);
    //add enumeration units to the map
    setEnumerationUnits(forestStates, map, path, colorScale);
    //add coordinated visualization to the map
    setChart(forestData, colorScale);
    //add dropdown menu to setMap
    createDropdown(forestData);
  };
}; //end of setMap function

//function to create the graticule
 function setGraticule(map, path){
    //create graticule generator
    var graticule = d3.geoGraticule()
        .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

    //create graticule background
    var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path) //project graticule]

    //create graticule lines
    var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
        .data(graticule.lines()) //bind graticule lines to each element to be created
        .enter() //create an element for each datum
        .append("path") //append each element to the svg as a path element
        .attr("class", "gratLines") //assign class for styling
        .attr("d", path); //project graticule lines
 };

//function to join the csv data to the topojson
 function joinData(forestStates, forestData){
   //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<forestData.length; i++){
       var csvState = forestData[i]; //the current state
       var csvKey = csvState.adm1_code; //the CSV primary key

       //loop through geojson states to find correct state
       for (var a=0; a<forestStates.length; a++){
           var geojsonProps = forestStates[a].properties; //the current state geojson properties
           var geojsonKey = geojsonProps.adm1_code; //the geojson primary key
           //where primary keys match, transfer csv data to geojson properties object
           if (geojsonKey == csvKey){
               //assign all attributes and values
               attArray.forEach(function(attr){
                   var val = parseFloat(csvState[attr]); //get csv attribute value
                   geojsonProps[attr] = val; //assign attribute and value to geojson properties
               });
           };
       };
   };
   return forestStates;
};

//function to draw the enumeration units on the map
function setEnumerationUnits(forestStates, map, path, colorScale){
    var units = map.selectAll(".units")
        .data(forestStates)
        .enter()
        .append("path")
        .attr("class", function(d){
          return "units " + d.properties.forest_land;
        })
        .attr("d", path)
        .style("fill", function(d){
          return choropleth(d.properties[expressed],colorScale);
        })
        .on("mouseover", function(d){
            highlight(d.properties);
                    })
        .on("mouseout", function(d){
                    dehighlight(d.properties);
                })
        .on("mousemove", moveLabel);

    var desc = units.append("desc")
        .text('{"stroke": "#000", "stroke-width": "1.5px"}');
};
//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#ccc";
    };
};

//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#edf8e9",
        "#bae4b3",
        "#74c476",
        "#31a354",
        "#006d2c"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
 };

 //function to create a dropdown menu for attribute selection
 function createDropdown(forestData){
     //add select element
     var dropdown = d3.select("body")
         .append("select")
         .attr("class", "dropdown")
         .on("change", function(){
            changeAttribute(this.value, forestData)
        });

     //add initial option
     var titleOption = dropdown.append("option")
         .attr("class", "titleOption")
         .attr("disabled", "true")
         .text("Select Attribute");

     //add attribute name options
     var attrOptions = dropdown.selectAll("attrOptions")
         .data(attArray)
         .enter()
         .append("option")
         .attr("value", function(d){ return d })
         .text(function(d){ return d });
 };

 //dropdown change listener handler
function changeAttribute(attribute, forestData){
    //change the expressed attribute
    expressed = attribute;
    //recreate the color scale
    var colorScale = makeColorScale(forestData);
    //recolor enumeration units
    var units = d3.selectAll(".units")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties[expressed], colorScale)
        })
  //re-sort, resize, and recolor bars
    var bars = d3.selectAll(".bars")
        //re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition() //add animation
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);
        updateChart(bars, forestData.length, colorScale);
};

 //function to create coordinated bar chart
 function setChart(forestData, colorScale){
     //chart frame dimensions
     var chartWidth = window.innerWidth * 0.38,
         chartHeight = 600;
     //create a second svg element to hold the bar chart
     var chart = d3.select("body")
         .append("svg")
         .attr("width", chartWidth)
         .attr("height", chartHeight)
         .attr("class", "chart");
     //create a rectangle for chart background fill
     var chartBackground = chart.append("rect")
         .attr("class", "chartBackground")
         .attr("width", chartWidth)
         .attr("height", chartHeight)
         //.attr("transform", translate);
   //create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
       .range([0, chartHeight])
       .domain([0, 100]);

         //set bars for each province
    var bars = chart.selectAll(".bars")
        .data(forestData)
        .enter()
        .append("rect")
        .sort(function(a, b){
           return b[expressed]-a[expressed]
       })
       .attr("class", function(d){
           return "bars " + d.adm1_code;
       })
        .attr("width", chartWidth / forestData.length - 6)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel)
        .attr("x", function(d, i){
            return i * (chartWidth / forestData.length) + leftPadding;
        })
        .attr("height", function(d){
           return 463 - yScale(parseFloat(d[expressed]));
       })
       .attr("y", function(d){
             return yScale(parseFloat(d[expressed])) + topBottomPadding;
         })
       .style("fill", function(d){
          return choropleth(d[expressed], colorScale);
      });

      var desc = bars.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}');

  //create vertical axis generator
      var yAxis = d3.axisLeft()
          .scale(yScale);

      //place axis
      var axis = chart.append("g")
          .attr("class", "axis")
          .attr("transform", translate)
          .call(yAxis);

      var chartTitle = chart.append("text")
       .attr("x", 40)
       .attr("y", 30)
       .attr("class", "chartTitle")
       .text("Amount of " + expressed + " in 15 US states");

      updateChart(bars, forestData.length, colorScale);
 };

//function to position, size, and color bars in chart
 function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){
            return choropleth(d[expressed], colorScale);
        });

        var chartTitle = d3.select(".chartTitle")
        .text("Amount of " + expressed + " in 15 US states");
};

//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.adm1_code)
        .style("stroke", "yellow")
        .style("stroke-width", "2")
    setLabel(props);
};

//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.adm1_code)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
        d3.select(".infolabel")
          .remove();
    };
};

//function to create dynamic label
function setLabel(props){
    //label content
    var labelAttribute = "<h1>" + props[expressed] +
        "</h1><b>" + expressed + "</b>";
    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.adm1_code + "_label")
        .html(labelAttribute);
    var unitName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.name);
};

//function to move info label with mouse
function moveLabel(){
  //get width of label
      var labelWidth = d3.select(".infolabel")
          .node()
          .getBoundingClientRect()
          .width;

      //use coordinates of mousemove event to set label coordinates
      var x1 = d3.event.clientX + 10,
          y1 = d3.event.clientY - 75,
          x2 = d3.event.clientX - labelWidth - 10,
          y2 = d3.event.clientY + 25;

      //horizontal label coordinate, testing for overflow
      var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
      //vertical label coordinate, testing for overflow
      var y = d3.event.clientY < 75 ? y2 : y1;

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

})(); //end of anonymous wrapper function
