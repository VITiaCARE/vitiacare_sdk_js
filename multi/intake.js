import { vitiaMultiObject } from './multi';
import { toUTCDateFromISO } from '../../helpers/datetime';
import { Intake } from '@vitiacare/vitiacare_sdk_js/classes/single/intake';

export class Intakes extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('intake');
  }

  
  async loadData(search_params, add=true, after_load_hook = null) {
    await super.loadData(search_params, add);
    for(var i = 0; i < this.value.length; i++){
      this.value[i].datetime = toUTCDateFromISO(this.value[i].datetime);
      this.value[i].original_notification_datetime = toUTCDateFromISO(this.value[i].original_notification_datetime);  
    }
    if(after_load_hook !== null) await after_load_hook(this.value);
    return this.value;
  }

  async confirm(id, mode = true) {
    let obj_id = id;
    await this.send_request('POST', `confirm_intake/${obj_id}`, { 'mode': mode });
    switch (this.response.status) {
      case 200:
        this.response.error = false;
        this.value.forEach((v) => v.taken = (v._key === id) ? mode : v.taken);
      default:
        this.response.error = true
        return {}
    }
  }

}