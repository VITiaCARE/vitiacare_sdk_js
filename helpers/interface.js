const { make_url, make_request, make_request_from_object } = require('./request').default
const data = require('../package.json' )
class Interface{
    constructor(host, auth){
        this.auth = auth
        this.host = host
        this.version = data.version
        this.useragent = `vitiaSDK/${this.version}/javascript`
        this._default_headers()
    }

    _default_headers(){
        this.headers = {
            "Authorization": this.auth,
            "User-Agent": this.useragent,
            "Origin": 'vitiaapp',
            "Content-Type": 'application/json'
        }
    }

    update_headers(new_headers, replace=false){
        if( replace === true){
            this.headers = new_headers
        } else {
            Object.assign(this.headers, new_headers)
        }
    }

    async send_request(method='GET', path='', json=null, params={}, timeout=null, send_as_form=false){
        this.method = method
        this.path = path
        this.json = json
        this.params = params
        this.timeout = timeout
        this.response = await make_request(this.host, this.path, this.params, this.method, this.json, this.headers, send_as_form) 
    }

    async test () {
      let config = {
        url: this.host,
        path: 'test',
        method: 'GET',
        headers: this.headers,
        query: null
      }
      this.response = {works:false};
      await this.send_request(config.method, config.path)
      return this.response.works;
    }
}

module.exports = { Interface }