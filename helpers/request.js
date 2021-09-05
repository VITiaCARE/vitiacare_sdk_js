function make_url(base, path=[], query={}) {
    var url;
    var url_base = base;
    var url_path = '';
    var url_query = '';
    if(path && path.length > 0) url_path = path.join('/');
    if(url_base.endsWith('/')) url_base = url_base.substring(0,url_base.length-1) 
    if(url_path.startsWith('/')) url_path = url_path.substring(1, url_path.length)
    if(query && query !== {}) {
        try {
            let query_array = Object.entries(query).map((k,v) => `${k}=${v}`)
            url_query = query_array.join('&') 
        } catch { 
            url_query = '' 
        }
    }
    url = `${url_base}/${url_path}`
    if(url_query !== '') url = `${url}?${url_query}`
    return url;
}

function make_request(url = '', path='', method= 'GET', payload={}, headers={}) {
    const request = new Request(make_url(url, path), {method: method, body: payload, headers:headers});
    return request
}

function make_request_from_object(config){
    return make_request(url=config.baseURL, path=config.url, method=config.method, payload=config.data, headers=config.headers);
}

module.exports = { make_url, make_request, make_request_from_object }