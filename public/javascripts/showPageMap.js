
mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: (coordinates), // starting position [lng, lat]
    zoom: 13, // starting zoom
});

new mapboxgl.Marker()
    // adds ,arker to map
    .setLngLat(coordinates)
    // when user clicks on marker
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `
            <h5 style="margin: 0.3rem auto 0 auto">${campgroundTitle}</h5>
            <ul style= "list-style-type: none; padding: 0">
                <li>${coordinates[1]},</li>
                <li>${coordinates[0]}</li>
            </ul>
            `
        )
    )
    // add map
    .addTo(map)

