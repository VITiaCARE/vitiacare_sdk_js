import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';

export class Message extends patientObject {

  constructor(userId, api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('message');
    if (rel_id !== null) {
      this.set_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async send(to, content){
    return this.post({from:this.get_user_id(), to, content}).then(() => true).catch(() => false);
  }
}