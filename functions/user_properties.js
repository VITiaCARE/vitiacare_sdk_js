
async function getLocation() {
  var loc;
  try{
    if (navigator && navigator !== undefined && navigator.geolocation) {
      loc = await getPosition().then((pos) => makePosition(pos), (err) => makePositionError(err));
      // let skipPosPromise = Promise(() => setTimeout(() => {"User did not respond on time."}, 5000));
      // loc = Promise.race(getPosPromise, skipPosPromise);
    } else { 
      loc = "Geolocation is not supported by this browser.";
    }
  } catch {
    loc = "Error getting browser location.";
  }
  return loc
}

async function getPosition() {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 10000
  };
  return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej, options);
  });
}

function makePosition(position) {
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