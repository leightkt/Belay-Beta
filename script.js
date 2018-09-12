const MAPQUEST_GEOCODER_URL = 'http://www.mapquestapi.com/geocoding/v1/address?';
const MOUNTAIN_PROJECT_URL = 'https://www.mountainproject.com/data/get-routes-for-lat-lon';
const OPEN_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';

const mapQuestKey = config.mapQuestKey;
const mountainProjectKey = config.mountainProjectKey;
const openWeatherKey = config.openWeatherKey;

var info = {
}

function getLatLongFromAPI(location, callback) {
  	const query = {
    key: mapQuestKey,
    location: location,
  }
  $.getJSON(MAPQUEST_GEOCODER_URL, query, callback);
}

function formatLocation(city, state){
	var location = city+','+state;
	return location;
}

function returnLatLong(result) {
	if (result.results[0].locations == 0) {
		var routeHTML = "<h3>Location Not Found</h3>";
  		displayMountainProjectData(routeHTML);
	} else {
		  var latitude = result.results[0].locations[0].displayLatLng.lat;
		  console.log(latitude);
		  var longitude = result.results[0].locations[0].displayLatLng.lng;
		  console.log(longitude);
		  info.lat = latitude;
		  info.lon = longitude;
	  	getRoutesFromAPI(info, sortRoutes);
	 	}
}

function getRoutesFromAPI(info, callback){
	const query = {
	key: mountainProjectKey,
	lat: info.lat,
	lon: info.lon,
	maxDistance: info.maxDistance,
	minDiff: info.minDiff,
	maxDiff: info.maxDiff,
	}
	$.getJSON(MOUNTAIN_PROJECT_URL, query, callback);
}

function sortRoutes(result){
	console.log(result);
	console.log(info);
	if ( result.routes == 0){
		var routeHTML = "<h3>No Routes Found Matching Your Criteria</h3>";
  		displayMountainProjectData(routeHTML);
	} else {
		var sortedRoutes = result.routes.filter(function(route) {
			return route.type == info.type;
		});
		orderRoutes(sortedRoutes);
	}
}

function orderRoutes(data){
	var orderedRoutes = data.sort(function (a, b) {
  	return b.stars - a.stars;
	});
	returnTopTen(orderedRoutes);
}

function returnTopTen(data) {
	var topTenRoutes = data.slice(0, 10);
	renderRoutes(topTenRoutes);
}

function renderRoutes(data){
	routeHTML = "";
	data.forEach(function(route) {
		routeHTML += '<section><h3>'+route.name+'</h3>\
		<h4>Route Type: '+route.type+'</h4>\
		<h4>Route Rating: '+route.rating+'</h4>\
		<h4>Route Stars: '+route.stars+'</h4>\
		<p class="hidden js-latitude" id="'+route.latitude+'"></p>\
		<p class="hidden js-longitude" id="'+route.longitude+'"></p><button type="submit" class="js-weather">Weather</button>\
		</section>';
	});
	displayMountainProjectData(routeHTML);
}

function getWeatherFromAPI(lat, lon, callback){
	const query = {
	lat: lat,
	lon: lon,
	APIkey: openWeatherKey,
	}
	$.getJSON(OPEN_WEATHER_URL, query, callback);
}

function orderWeather(result){
	console.log(result);
}


function displayMountainProjectData(data) {
  $('.js-routeList-display').html(data);
}

function clearForm(cityTarget, stateTarget, minDiffTarget, maxDiffTarget, maxDistanceTarget, typeTarget){
	cityTarget.val("");
	stateTarget.val("");
	minDiffTarget.val("");
	maxDiffTarget.val("");
	maxDistanceTarget.val("");
	typeTarget.val("");
}

function toggleRoutes(){
	$('.js-routeList-display').toggleClass("hidden");
}

function toggleWeather(){
	$('.js-weather-display').toggleClass("hidden");
}

function checkDifficultyScale(maxDiff, minDiff, location) {
	if (maxDiff < minDiff) {
		var routeHTML = "<h3>Please Enter a Maximum Difficulty Greater than the Minimum Difficulty</h3>";
  		displayMountainProjectData(routeHTML);
	} else {
	getLatLongFromAPI(location, returnLatLong);
	}
}

// function clearRouteData() {
// 	$('.js-routeList-display').html("");
// }

function getLocation() {
  $('form').submit(event => {
    event.preventDefault();
    console.log('clicked submit');
    // clearRouteData();
    var cityTarget = $(event.currentTarget).find('.js-city-input');
    var city = cityTarget.val();
    var stateTarget = $(event.currentTarget).find('.js-state-input');
    var state = stateTarget.val();
    var location = formatLocation(city, state);
    var typeTarget = $(event.currentTarget).find('.js-route-type');
    info.type = typeTarget.val();
    var minDiffTarget = $(event.currentTarget).find('.js-min-difficulty');
    info.minDiff = minDiffTarget.val();
    var maxDiffTarget = $(event.currentTarget).find('.js-max-difficulty');
    info.maxDiff = maxDiffTarget.val();
    var maxDistanceTarget = $(event.currentTarget).find('.js-max-distance');
    info.maxDistance = maxDistanceTarget.val();
    checkDifficultyScale(info.maxDiff, info.minDiff, location);
    clearForm(cityTarget, stateTarget, minDiffTarget, maxDiffTarget, maxDistanceTarget, typeTarget);
  });
}

function getWeather() {
	$('main').on('click', 'button.js-weather', function(){
		event.preventDefault();
		toggleRoutes();
		toggleWeather();
		var lat = $(this).closest('section').find('.js-latitude').attr("id");
		var lon = $(this).closest('section').find('.js-longitude').attr("id");
		getWeatherFromAPI(lat, lon, orderWeather);
	});
}


function hideWeather() {
	$('main').on('click', 'button.js-weather-hide', function(){
		event.preventDefault();
		toggleRoutes();
		toggleWeather();
	});
}

function masterFunction() {
	getLocation();
	getWeather();
	hideWeather();
}

masterFunction();