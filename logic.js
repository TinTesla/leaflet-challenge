// Define a color scale for the depth range
var colorScale = d3.scaleLinear()
  .domain([-10, 10, 30, 50, 70, 90])
  .range(['green', 'limegreen', 'yellow', 'gold', 'orange', 'orangered', 'red']);

// Create a Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Add the tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

// Function to update the map with earthquake data
function updateMap() {
  // Retrieve the JSON data
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
      // Loop through each earthquake entry
      data.features.forEach(feature => {
        // Extract the necessary properties
        var place = feature.properties.place;
        var time = feature.properties.time;
        var status = feature.properties.status;
        var magType = feature.properties.magType;
        var longitude = feature.geometry.coordinates[0];
        var latitude = feature.geometry.coordinates[1];
        var depth = feature.geometry.coordinates[2];

        // Create a marker for the earthquake
        var marker = L.circleMarker([latitude, longitude], {
          radius: magType === 'ml' ? 5 : 3,
          color: colorScale(depth),
          fillOpacity: 0.8
        });

        // Add the marker to the map
        marker.addTo(map);

        // Create hover text for the marker
        var hoverText = `
          <b>Location:</b> ${place}<br>
          <b>Time:</b> ${new Date(time)}<br>
          <b>Status:</b> ${status}<br>
          <b>Magnitude:</b> ${magType}<br>
          <b>Longitude:</b> ${longitude}<br>
          <b>Latitude:</b> ${latitude}<br>
          <b>Depth:</b> ${depth}<br>
        `;

        // Add a tooltip to the marker
        marker.bindTooltip(hoverText);
      });
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

// Update the map initially
updateMap();

// Update the map every 5 minutes
setInterval(updateMap, 5 * 60 * 1000);

// Add legend image overlay
var legendImage = L.control({ position: 'bottomright' });

legendImage.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML = '<img src="Scale.jpg" alt="Legend" width="100">';
  return div;
};

legendImage.addTo(map);