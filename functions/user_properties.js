function getLocation() {
    if (navigator && navigator.geolocation) {
      pos = navigator.geolocation.getCurrentPosition(makePosition, makePositionError);
    } else { 
      pos = "Geolocation is not supported by this browser.";
    }
    return pos;
  }
  
function makePosition(position) {
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