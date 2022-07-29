function toUTCDateFromISO(dateString, timezonediff_mins = null) {
    if (timezonediff_mins === null) timezonediff_mins = new Date().getTimezoneOffset();
    let parts = []
    if(dateString.length >= 4) {
        parts.push(dateString.substring(0,4))
    }
    if(dateString.length >= 7) {
        parts.push(dateString.substring(5,7) - 1) 
    }
    if(dateString.length >= 10) {
        parts.push(dateString.substring(8,10))
    }
    if(dateString.length >= 13) {
        parts.push(dateString.substring(11,13))
    }
    if(dateString.length >= 16) {
        parts.push(dateString.substring(14,16))
    }
    if(dateString.length >= 19) {
        parts.push(dateString.substring(17,19))
    }
    if(dateString.length >= 26) {
        parts.push(dateString.substring(20,26))
    }
    let base_date = new Date(...parts);
    let offset_date = new Date(0);
    offset_date.setMinutes(-1*timezonediff_mins);
    return new Date(base_date.getTime() + offset_date.getTime());
}



module.exports = { toUTCDateFromISO }
