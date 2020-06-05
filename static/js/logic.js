// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var earthquakes = new L.LayerGroup();

 // Define streetmap and darkmap layers
 var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});
var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox/dark-v10",
  accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap
};

//Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [streetmap, earthquakes]
});



// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

  function styleInfo(feature){
    return{
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color:"#000000",
      radius:getRadius(feature.properties.mag),
      stroke:true,
      weight:0.5
    };
  }

    function getColor(magnitude){
      switch(true){
        case magnitude >5:
          return "purple";
        case magnitude >4:
          return "blue";
        case magnitude >3:
          return "red";
        case magnitude >2:
          return "orange";
        case magnitude >1:
          return "yellow";
        case magnitude <1:
          return "lightgreen";
      }
    }

    function getRadius(magnitude){
      return magnitude*10;
    }

    L.geoJSON(data, {
      pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng)
      },

      style: styleInfo,
        onEachFeature: function(feature,layer){
          layer.bindPopup("Magnitude: "+ feature.properties.mag + "<br> Location: "+ feature.properties.place);
        }
    }).addTo(earthquakes)
    earthquakes.addTo(myMap)

  // Add Legend
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ["lightgreen", "yellow", "orange", "red", "blue", "purple"];

    for (var i=0;i<grades.length;i++){
      console.log(colors[i]);
      div.innerHTML  += 
        "<i style= 'background: " + colors[i] + "'></i>" + grades[i] + (grades[i+1] ? "&ndash;" + grades[i+1]+ "<br>" : "+" );
    }
    return div;
  };

  legend.addTo(myMap);
});
