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
  promises.push(d3.json("data/forest-states.topojson")); //load choropleth spatial data
  Promise.all(promises).then(callback);
};
