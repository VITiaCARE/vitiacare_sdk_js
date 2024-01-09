import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

export class Vital extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('vital');
    if (access_token !== null) this.set_access_token(access_token);
  }

  async findByName(name){
    const { Vitals } = require('../multi/vital');
    let vitals = new Vitals(this.api_url, this.api_key);
    let search_params = {name: name};
    await vitals.loadData(search_params, false);
    if(vitals.response.error === false) {
      this.value = Object.assign({},vitals.value[0]);
      this.search_results = vitals.value.map(e=>e);
    }
    return this.search_results
  }

}
