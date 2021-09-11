function getLocation() {
  if (navigator && navigator.geolocation) {
    console.debug("Navnav")
    console.debug(navigator.geolocation.getCurrentPosition((r) => r))
    return navigator.geolocation.getCurrentPosition(makePosition, makePositionError);
  } else { 
    console.debug("Geolocation is not supported by this browser.")
    return "Geolocation is not supported by this browser.";
  }

}

function makePosition(position) {
console.debug(position)
return  `${position.coords.latitude},${position.coords.longitude}`;
}

function makePositionError(error) {
switch(error.code) {
  case error.PERMISSION_DENIED:
    return "User denied the request for Geolocation."
  case error.POSITION_UNAVAILABLE:
    return "Location information is unavailable."
  case error.TIMEOUT:
    return "The request to get user location timed out."
  case error.UNKNOWN_ERROR:
    return "An unknown error occurred."
}
}

module.exports = { getLocation }