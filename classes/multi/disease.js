import { vitiaMultiObject } from '@vitiacare/vitiacare_sdk_js/classes/multi/multi';

export class Diseases extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('disease');
  }

  async findByName(name){
    let search_params = {name: name};
    return await this.loadData(search_params, false).then(() => this.get_data())
  }
 

}