import { vitiaMultiObject } from '@vitiacare/vitiacare_sdk_js/classes/multi/multi';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Messages extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('message');
  }

  async getMessages(from, to, options = {}, add = false) {
    var search_params = options;
    Object.assign(search_params, { to, from });
    await this.loadData(search_params, add);
    return this.value;
  }

  async send(from, to, content){
    return this.create({from, to, content}).then(() => true).catch(() => false);
  }
  
  // async read(id, mode = true) {
  //   let obj_id = id;
  //   await this.send_request('POST', `message/${obj_id}/read`, { 'mode': mode });
  //   switch (this.response.status) {
  //     case 200:
  //       this.response.error = false
  //     default:
  //       this.response.error = true
  //       return {}
  //   }
  // }

  // unread(id) {
  //   this.read(id, false)
  // }
  

}