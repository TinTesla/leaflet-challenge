// Initialize the map
var myMap = L.map('map').setView([0, 0], 2);

// Create a tile layer for the map background
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(myMap);

// Define a color scale for the depth range
var colorScale = d3.scaleLinear()
  .domain([-10, 10, 30, 50, 70, 90])
  .range(['green', 'limegreen', 'yellow', 'gold', 'orange', 'orangered', 'red']);

// Add a legend control to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  var labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];

  for (var i = 0; i < labels.length; i++) {
    div.innerHTML +=
      '<i style="background:' + colorScale(labels[i]) + '"></i> ' +
      labels[i] + '<br>';
  }

  return div;
};

legend.addTo(myMap);

// Function to update the map
function updateMap() {
  // Fetch the JSON data
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Remove existing markers from the map
      myMap.eachLayer(function (layer) {
        if (layer instanceof L.CircleMarker) {
          myMap.removeLayer(layer);
        }
      });

      // Add markers to the map for each earthquake entry
      data.features.forEach(function (feature) {
        var properties = feature.properties;
        var coordinates = feature.geometry.coordinates;

        // Create a circle marker
        var marker = L.circleMarker([coordinates[1], coordinates[0]], {
          radius: properties.mag * 2, // Adjust the radius multiplier as desired
          color: colorScale(coordinates[2]),
          fillOpacity: 0.8
        });

        // Add hover text to the marker
        marker.bindPopup(
          '<strong>Location:</strong> ' + properties.place + '<br>' +
          '<strong>Date:</strong> ' + properties.mag + '<br>' +
          '<strong>Magnitude:</strong> ' + properties.mag + '<br>' +
          '<strong>Depth:</strong> ' + coordinates[2] + ' km'
        );

        // Add the marker to the map
        marker.addTo(myMap);
      });
    });
}

// Call the updateMap function to initially populate the map
updateMap();

// Update the map every 5 minutes
setInterval(updateMap, 5 * 60 * 1000);
