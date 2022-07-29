import { vitiaMultiObject } from '@vitiacare/vitiacare_sdk_js/classes/multi/multi';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Referrals extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('invitation');
  }

  async getReferrals(user=null) {
    var search_params;
    let user_id = (user === null) ? this.user_id : user;
    search_params = { _from: user_id };
    await this.loadData(search_params, false);
    return this.value;
  }
  
  async notify(id) {
    let obj_id = id;
    await this.send_request('POST', `invitation/${obj_id}/resend`, {});
    switch (this.response.status) {
      case 200:
        this.response.error = false
        return await this.response.json().then(r => r.res);
      default:
        this.response.error = true
        return false
    }
  }

}