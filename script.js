const MAPQUEST_GEOCODER_URL = 'http://www.mapquestapi.com/geocoding/v1/address?';
const MOUNTAIN_PROJECT_URL = 'https://www.mountainproject.com/data/get-routes-for-lat-lon';
const OPEN_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';
const MAPQUEST_REVERSE_GEOCODER_URL = 'http://www.mapquestapi.com/geocoding/v1/reverse';

const mapQuestKey = config.mapQuestKey;
const mountainProjectKey = config.mountainProjectKey;
const openWeatherKey = config.openWeatherKey;

var routeRatings = {
	'5.0' : 1,
	'5.1' : 2,
	'5.2' : 3,
	'5.3' : 4,
	'5.4' : 5,
	'5.5' : 6,
	'5.6' : 7,
	'5.7' : 8,
	'5.8' : 9,
	'5.9' : 10,
	'5.10a' : 11,
	'5.10b' : 12,
	'5.10c' : 13,
	'5.10d' : 14,
	'5.11a' : 15,
	'5.11b' : 16,
	'5.11c' : 17,
	'5.11d' : 18,
	'5.12a' : 19,
	'5.12b' : 20,
	'5.12c' : 21,
	'5.12d' : 22,
	'5.13a' : 23,
	'5.13b' : 24,
	'5.13c' : 25,
	'5.13d' : 26,
	'5.14a' : 27,
	'5.14b' : 28,
	'5.14c' : 29,
	'5.14d' : 30,
	'5.15a' : 31,
	'5.15b' : 32,
	'5.15c' : 33,
	'5.15d' : 34,
}

var info = {
}

function checkDifficultyScale(maxDiff, minDiff, location) {
	var maxDiff = routeRatings[maxDiff];
	var minDiff = routeRatings[minDiff];
	if (maxDiff < minDiff) {
		var routeHTML = "<h3>Please Enter a Maximum Difficulty Greater than the Minimum Difficulty</h3>";
  		displayMountainProjectData(routeHTML);
	} else {
	getLatLongFromAPI(location, returnLatLong);
	}
}

function formatLocation(city, state){
	var location = city+','+state;
	return location;
}

function getLatLongFromAPI(location, callback) {
  	const query = {
    key: mapQuestKey,
    location: location,
  }
  $.getJSON(MAPQUEST_GEOCODER_URL, query, callback);
}

function getSearchedLocationAPI(location, callback) {
  	const query = {
    key: mapQuestKey,
    location: location,
  }
  $.getJSON(MAPQUEST_REVERSE_GEOCODER_URL, query, callback);
}


function returnLatLong(result) {
	var latitude = result.results[0].locations[0].displayLatLng.lat;
	var longitude = result.results[0].locations[0].displayLatLng.lng;
	var location = latitude+','+longitude;
	getSearchedLocationAPI(location, renderLocationFoundbyAPI);
	if (result.results[0].locations == 0) {
		var routeHTML = '<h3 class="tagline">Location Not Found</h3>';
  		displayMountainProjectData(routeHTML);
	} else {
		  info.lat = latitude;
		  info.lon = longitude;
	  	getRoutesFromAPI(info, sortRoutes);
	 	}
}

function renderLocationFoundbyAPI(result) {
	var locationCity = result.results[0].locations[0].adminArea5;
	var locationState = result.results[0].locations[0].adminArea3;
	var map = result.results[0].locations[0].mapUrl;
	var locationHTML = '<section class="map location-map"> <h4>Location Searched: '+locationCity+', '+locationState+'</h4>\
	<iframe height="250" width="200" border="0" marginwidth="0" marginheight="0" src="https://www.mapquest.com/embed/search/results?query='+locationCity+',%20'+locationState+'&zoom=10&maptype=undefined" allow="geolocation *;"></iframe>\
	</section>';
	displaySearchedLocation(locationHTML);
}

function getRoutesFromAPI(info, callback){
	const query = {
	key: mountainProjectKey,
	lat: info.lat,
	lon: info.lon,
	maxDistance: info.maxDistance,
	maxResults: '100',
	minDiff: info.minDiff,
	maxDiff: info.maxDiff,
	}
	$.getJSON(MOUNTAIN_PROJECT_URL, query, callback);
}

function sortRoutes(result){
	if ( result.routes == 0){
		var routeHTML = '<h3 class="tagline">No Routes Found Matching Your Criteria</h3>';
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

function renderRouteLocation(data){
	var routeLocationArray = [];
	data.location.forEach(function(loc) {
			routeLocationArray.push(loc);
		});
	var routeLocation = routeLocationArray.join(', ');
	return routeLocation
}

function renderRoutes(data){
	var routeHTML = "";
	data.forEach(function(route) {
		var routeLocationHTML = renderRouteLocation(route);
		routeHTML += '<section class="route col-4" id="'+route.name+'"><h3 class="route-name">'+route.name+'</h3>\
		<h4>Route Location: '+routeLocationHTML+'</h4>\
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
	units: 'imperial',
	}
	$.getJSON(OPEN_WEATHER_URL, query, callback);
}

function orderWeather(result){
	var temp = result.main.temp;
	var humidity = result.main.humidity;
	var windSpeed = result.wind.speed;
	var sunrise = Unix_timestamp(result.sys.sunrise);
	var sunset = Unix_timestamp(result.sys.sunset);
	var weatherDescription = result.weather[0].description;
	var locationName = result.name;
	renderWeather(temp, humidity, windSpeed, sunrise, sunset, weatherDescription, locationName);
}

function Unix_timestamp(t)
{
var dt = new Date(t*1000);
var hr = dt.getHours();
var m = "0" + dt.getMinutes();
var s = "0" + dt.getSeconds();
return hr+ ':' + m.substr(-2) + ':' + s.substr(-2);  
}

function renderWeather(temp, humidity, windSpeed, sunrise, sunset, weatherDescription, locationName){
	weatherHTML = '<section class="weather-card"><h4 class="route-name">Route Name: '+info.routeName+'</h4>\
		<h4>Location: '+locationName+'</h4>\
		<h4>Current Temperature: '+temp+' F</h4>\
		<h4>Humidity: '+humidity+'%</h4>\
		<h4>Wind Speed: '+windSpeed+'mph</h4>\
		<h4>Weather Description: '+weatherDescription+'</h4>\
		<h4>Sunrise: '+sunrise+'</h4>\
		<h4>Sunset: '+sunset+'</h4>\
		<button type="submit" class="js-weather-hide">Return to Route List</button>\
		<br></section>';
	displayWeatherData(weatherHTML);
}

function renderRouteMap(lat, lon){
	var locationHTML = '<section class="map"><iframe height="250" width="200" border="0" marginwidth="0" marginheight="0" src="https://www.mapquest.com/embed/latlng/'+lat+','+lon+'?center='+lat+','+lon+'&zoom=10&maptype=undefined" allow="geolocation *;"></iframe>\
		</section>';
	displayRouteLocation(locationHTML);
}

//update display
function displayMountainProjectData(data) {
  $('.js-routeList-display').html(data);
}

function displayWeatherData(data) {
  $('.js-weather-display').html(data);
}

function displaySearchedLocation(data) {
	$('.js-location-display').html(data);

}

function displayRouteLocation(data) {
	$('.js-routeMap-display').html(data);

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

function toggleForm(){
	$('form').toggleClass("hidden");
}

function toggleLocationMap(){
	$('.js-location-display').toggleClass("hidden");
}

function clearRouteData() {
	$('.js-routeList-display').html("");
}

function clearLocationDisplay(){
	$('.js-location-display').html("");
}

function clearRouteMapDisplay(){
	$('.js-routeMap-display').html("");
}

function addAnimation(){
	$('.tagline').addClass("tagline-animation");
	$('form').addClass("form-animation");
}

function resetAnimation(){
	$('.tagline').removeClass("tagline-animation");
	$('form').removeClass("form-animation");
}

//event listeners
function getLocation() {
  $('form').submit(event => {
    event.preventDefault();
    clearRouteData();
    addAnimation();
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
   });
}

function getWeather() {
	$('main').on('click', 'button.js-weather', function(){
		event.preventDefault();
		toggleRoutes();
		toggleWeather();
		toggleForm();
		toggleLocationMap();
		var lat = $(this).closest('section').find('.js-latitude').attr("id");
		var lon = $(this).closest('section').find('.js-longitude').attr("id");
		info.routeName = $(this).closest('section').attr("id");
		getWeatherFromAPI(lat, lon, orderWeather);
		renderRouteMap(lat, lon);
	});
}

function hideWeather() {
	$('main').on('click', 'button.js-weather-hide', function(){
		event.preventDefault();
		toggleRoutes();
		toggleWeather();
		toggleForm();
		toggleLocationMap();
		clearRouteMapDisplay();
	});
}

function newSearch() {
	$('main').on('click', 'button.js-new-search', function(){
		event.preventDefault();
		var cityTarget = $(event.currentTarget).find('.js-city-input');
    	var stateTarget = $(event.currentTarget).find('.js-state-input');
    	var typeTarget = $(event.currentTarget).find('.js-route-type');
    	var minDiffTarget = $(event.currentTarget).find('.js-min-difficulty');
    	var maxDiffTarget = $(event.currentTarget).find('.js-max-difficulty');
    	var maxDistanceTarget = $(event.currentTarget).find('.js-max-distance');
		clearForm(cityTarget, stateTarget, minDiffTarget, maxDiffTarget, maxDistanceTarget, typeTarget);
		clearRouteData();
		clearLocationDisplay();
		resetAnimation();
	});
}

function masterFunction() {
	getLocation();
	getWeather();
	hideWeather();
	newSearch();
}

masterFunction();