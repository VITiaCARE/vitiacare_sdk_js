import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class ProfileStatus extends patientObject {


  constructor(userId, api_url = null, api_key = null, intake_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('profile_status');
    if (intake_id !== null) {
      this.set_id(intake_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async loadData(userId, after_load_hook=null) {
    await this.send_request('GET', `patient/${userId}/${this.obj_type}`);
    switch(this.response.status) {
      case 200:
        await this.response.json().then(async (data) => {
          await Object.assign(this.holder, data); 
          await Object.assign(this.value, data);
          this.set_id(this.value._key);
          if(after_load_hook !== null){ after_load_hook(this.value);}
          this.response.error = false;
        });
        break;
      default:
        this.response.error = true;    
        throw this.response.status;
      }
    }


}
