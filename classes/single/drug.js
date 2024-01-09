import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

export class Drug extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('drug');
    if (access_token !== null) this.set_access_token(access_token);
  }

  async findByName(name){
    const { Drugs } = require('../multi/drug');
    let drugs = new Drugs(this.api_url, this.api_key);
    let search_params = {name: name};
    await drugs.loadData(search_params, false);
    if(drugs.response.error === false) {
      this.value = Object.assign({},drugs.value[0]);
      this.search_results = drugs.value.map(e=>e)
    }
    return this.search_results
  }

}
