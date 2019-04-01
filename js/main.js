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
      .center([39.81, -98.55])
      .rotate([-2, 0, 0])
      .parallels([43, 62])
      .scale(2500)
      .translate([width/2, height/2]);

  //use Promise to make the data load in parallel
  var promises = [];
  promises.push(d3.csv("data/state_data.csv")); //load csv with data attributes for each state
  promises.push(d3.json("data/contiguous.topojson")); //load background spatial data
  promises.push(d3.json("data/forest_states.topojson")); //load choropleth spatial data
  Promise.all(promises).then(callback);

  //function to call back to setMap and to prepare some variables
  function callback(data){
    forestData = data[0];
    contig = data[1];
    forests = data[2];
    //console.log(forestData);
    //console.log(contig);
    //console.log(forests);
 var contigUS = topojson.feature(contig, contig.objects.contiguous),
     forestStates = topojson.feature(forests, forests.objects.forest_states);

        //examine the results
        console.log(contigUS);
        console.log(forestStates);
  };
};
