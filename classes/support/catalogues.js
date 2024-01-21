
const { vitiaMultiObject } = require('../multi/multi')
class Catalogues extends vitiaMultiObject {


  constructor(api_url = null, api_key = null, catalogue_type = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('catalogue/' + catalogue_type );
    if (access_token !== null) this.set_access_token(access_token);
  }

}

module.exports = {
  Catalogues
}