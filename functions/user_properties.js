
async function getLocation() {
  var loc;
  if (navigator && navigator.geolocation) {
    console.log(navigator);
    console.log(navigator.geolocation);
    loc = await getPosition().then((pos) => makePosition(pos), (err) => makePositionError(err));
  } else { 
    loc = "Geolocation is not supported by this browser.";
  }
  console.log(loc);
  return loc
}

async function getPosition() {
  return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
  });
}

function makePosition(position) {
  console.log(position);
  console.log(`${position.coords.latitude},${position.coords.longitude}`);
  return `${position.coords.latitude},${position.coords.longitude}`;
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