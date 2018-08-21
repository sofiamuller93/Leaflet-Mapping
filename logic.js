// Store our API endpoint inside queryUrl
// Getting data of all M2.5+ earthquakes from the past week
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

console.log('query read')

// Perform GET request to the query URL 
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data features to the createFeatures function
  createFeatures(data.features);
  console.log('json read')
});

function createFeatures(earthquakeData) {
  
  // Print earthquake data
  console.log(earthquakeData)
  
  // Define a function we weant to run once for each feature in the features array
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  function getColor(d) {
    return d < 3  ? '#98ff6e' :
          d < 4  ? '#FFFF00' :
          d < 5  ? '#FFA500' :
          d < 6  ? '#ff0000' :
                    '#f08b5c';
  }
  
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      // Create circle markers
      var geojsonMarkerOptions = {
        radius: 5*feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

      return L.circleMarker(latlng, geojsonMarkerOptions);
    } 
  });

  // Sending out earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define streetmap layer
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold base layer
  var baseMaps = {
    "Street Map": streetmap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  var myMap = L.map("map", {
    center: [
      23.6345, -102.5528
    ],
    zoom: 6,
    layers: [streetmap, earthquakes]
  });

  // Create a circle and pass in some initial options
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  function getColor(d) {
    return d < 2 ? '#42f4d9' : 
          d < 3  ? '#98ff6e' :
          d < 4  ? '#FFFF00' :
          d < 5  ? '#ef771c' :
          d < 6  ? '#ab1313' :
                    '#7e0b0b';
  }

  // Create a legend to display information about our map
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5];

      div.innerHTML+='<h4>Magnitude</h4><hr>'
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(myMap);
}