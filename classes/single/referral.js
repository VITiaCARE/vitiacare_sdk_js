import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';

export class Referral extends patientObject {

  constructor(userId, api_url = null, api_key = null, referral_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('referral');
    if (referral_id !== null) {
      this.set_id(referral_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async notify(id = null) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('POST', `/patient/${this.getPatientId()}/referral/${obj_id}/notify`, {});
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
