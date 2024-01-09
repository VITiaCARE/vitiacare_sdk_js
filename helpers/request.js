
function make_url(base, path=[], query={}) {
    var url;
    var url_base = base;
    var url_path = '';
    var url_query = '';
    if(path && Array.isArray(path) && path.length > 0) url_path = path.join('/');
    else if (path && (typeof path === 'string' || path instanceof String)) url_path = path
    else path = '';
    if(url_base.endsWith('/')) url_base = url_base.substring(0,url_base.length-1) 
    if(url_path.startsWith('/')) url_path = url_path.substring(1, url_path.length)
    if(query && query != {}) {
        try {
            let query_array = Object.entries(query).filter(([k,v]) => k!=null && v!=null).map(([k,v]) => `${k}=${v}`)
            url_query = query_array.join('&') 
        } catch { 
            url_query = '' 
        }
    }
    url = `${url_base}/${url_path}`
    if(url_query !== '') url = `${url}?${url_query}`
    return url;
}

async function make_request(url = '', path='', query={}, method= 'GET', payload=null, headers={}, send_as_form = false) {
    let options = {method: method, headers:headers}
    if(!['GET','HEAD'].includes(method)) {
        // if(send_as_form === true) {
        //     options.body = payload
        // }else {
            options.body = JSON.stringify(payload)
        // }
    }
    let response = await fetch(make_url(url, path, query), (options)).catch((error) => {
        console.debug(url, path, query, make_url(url, path, query), (options));
        console.debug(error);
        return {name: "Network Error", status: 9000}
    })
    return response
}

async function make_request_from_object(config){
    let response = await make_request(url=config.url, path=config.path, query=config.query, method=config.method, payload=config.data, headers=config.headers);
    return response;
}

module.exports = { make_url, make_request, make_request_from_object }