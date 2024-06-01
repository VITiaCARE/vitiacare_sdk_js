import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';

export class Reward extends patientObject {

  constructor(userId, api_url = null, api_key = null, reward_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('rewards');
    if (reward_id !== null) {
      this.set_id(reward_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }
  
  async getBalance(){
    await this.send_request('GET', `patient/${this.patientId}/rewards/balance`);
    switch (this.response.status) {
      case 200:
        return this.response.json().then(async (data) => {
          return data;
        })
      default:
        this.response.error = true
        return null;
      }

  }

}
