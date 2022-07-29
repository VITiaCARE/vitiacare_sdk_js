import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

export class Referral extends vitiaObject {

  constructor(api_url = null, api_key = null) {
    super(api_url, api_key);
    this.set_type('invitation');
  }

  async notify(id = null) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('POST', `relation/${obj_id}/sendInvite`, {});
    switch (this.response.status) {
      case 200:
        this.response.error = false
        this.value.confirmed = mode;
        return await this.response.json().then(r => r.res);
      default:
        this.response.error = true
        return false
    }
  }

}
