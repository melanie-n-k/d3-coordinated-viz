/* javascript sheet mkohls */
//D3 lab

//when window loads, start running script
window.onload = setMap();

//set up choropleth with setMap function
function setMap(){
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
