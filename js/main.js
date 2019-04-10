/* javascript sheet mkohls */
//D3 lab

//anonymous function to keep everything local
(function(){

  //variables for data join
 var attArray = ["forest_land", "timber_land", "live_trees", "dead_trees", "carbon_live"];
 var expressed = attArray[0]; //initial attribute

//when window loads, start running script
window.onload = setMap();

//set up choropleth with setMap function
function setMap(){
//map dimensions
  var width = window.innerWidth * 0.5,
      height = 460;

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
        });
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

 //function to create coordinated bar chart
 function setChart(forestData, colorScale){
     //chart frame dimensions
     var chartWidth = window.innerWidth * 0.425,
         chartHeight = 460;

     //create a second svg element to hold the bar chart
     var chart = d3.select("body")
         .append("svg")
         .attr("width", chartWidth)
         .attr("height", chartHeight)
         .attr("class", "chart");
 };
})(); //end of anonymous wrapper function
