mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
	container: 'show-map', // container ID
	style: 'mapbox://styles/mapbox/light-v10', // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 8, // starting zoom
})

map.addControl(new mapboxgl.NavigationControl(), 'bottom-left')

new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h3>${campground.title}</h3><p>${campground.location}}</p>`
		)
	)
	.addTo(map)

//different option to set HTML would be via ajax request and so avoid having the campground <%-JsonStringify%> vulnerability...keeping simple and practising sanitzing input here but there is an alternative
