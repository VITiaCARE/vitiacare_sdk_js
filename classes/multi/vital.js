import { vitiaMultiObject } from '@vitiacare/vitiacare_sdk_js/classes/multi/multi';

export class Vitals extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('vital');
  }
 
  async fromPreset(preset_id){
    await this.send_request('GET', `vitals/preset/${preset_id}`);
    switch (this.response.status) {
      case 200:
        return this.response.json().then(async (data) => {
          this.value = data.map(x => x)
          return data;
        })
      default:
        this.response.error = true
        return [];
      }
  }

  async getBasicVitals() {
    let search_params = { basic: true };
    await this.loadData(search_params);
    return this.value;
  }

  // async findByName(name,conf=null ){
  //   const { Vitals } = require('../multi/measurement');
  //   let vitals = new Vitals(this.api_url, this.api_key, this.getStore());
  //   let search_params = {name: name};
  //   let search_result = await vitals.loadData(search_params, false, 1);
  //   if(search_result.error === false) {
  //     this.value = Object.assign({},vitals.value[0]);
  //   }
  //   return search_result
  // }

}
