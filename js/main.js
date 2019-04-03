/* javascript sheet mkohls */
//D3 lab

//when window loads, start running script
window.onload = setMap();

//set up choropleth with setMap function
function setMap(){
//map dimensions
  var width = 960,
      height = 460;

  //create a container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

  //set up porjection: Albers equal area for usa
  var projection = d3.geoAlbers()
      .center([-3.64, 39.05])
      .rotate([95.5, 1.82, 0])
      .parallels([29.5, 45.5])
      .scale(650)
      .translate([width/2, height/2]);

  //create a path generator
  var path = d3.geoPath()
      .projection(projection);

  //use Promise to make the data load in parallel
  var promises = [];
  promises.push(d3.csv("data/state_data.csv")); //load csv with data attributes for each state
  promises.push(d3.json("data/contig.topojson")); //load background spatial data
  promises.push(d3.json("data/forest.topojson")); //load choropleth spatial data
  Promise.all(promises).then(callback);

  //function to call back to setMap and to prepare some variables
  function callback(data){
    forestData = data[0];
    contig = data[1];
    forests = data[2];
    //console.log(forestData);
    //console.log(contig);
    //console.log(forests);
 var contigUS = topojson.feature(contig, contig.objects.contig),
     forestStates = topojson.feature(forests, forests.objects.forest);

        //examine the results
        console.log(contigUS);
        console.log(forestStates);

  var states = map.append("path")
      .datum(contigUS)
      .attr("class", "states")
      .attr("d", path);

  var units = map.selectAll(".units")
      .data(forestStates)
      .enter()
      .append("path")
      .attr("class", function(d){
        return "units " + d.properties.adm1_code;
      })
      .attr("d", path);

//create the graticule generator to put lines every 5 degrees of lat/long
  var graticule = d3.geoGraticule()
      .step([5, 5]);

  //create graticule background
  var gratBackground = map.append("path")
      .datum(graticule.outline()) //bind graticule background
      .attr("class", "gratBackground") //assign class for styling
      .attr("d", path); //project graticule

  var gratLines = map.selectAll(".gratlines")
      .data(graticule.lines()) //bind graticule lines to each element to be created
      .enter() //create an element for each datum
      .append("path") //append each element to the svg as a path element
      .attr("class", "gratLines") //assign class for styling
      .attr("d", path); //project graticule lines

  };
};
