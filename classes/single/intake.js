import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';
import { toUTCDateFromISO } from '../../helpers/datetime';

export class Intake extends patientObject {

  constructor(userId, api_url = null, api_key = null, intake_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('intake');
    if (intake_id !== null) {
      this.set_id(intake_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async loadData(obj_id, after_load_hook=null) {
    await super.loadData(obj_id);
    this.value.datetime = toUTCDateFromISO(this.value.datetime);
    this.value.original_notification_datetime = toUTCDateFromISO(this.value.original_notification_datetime);
    if(after_load_hook !== null) after_load_hook(this.value);
  }
  

  async confirm(id = null, mode = null) {
    let obj_id = (id !== null) ? id : this.get_id();
    await this.send_request('POST', `patient/${this.getPatientId()}/${this.obj_type}/${obj_id}/confirm`, { 'mode': mode });
    switch (this.response.status) {
      case 200:
        await this.response.json().then(async (data) => {
          this.value.taken = data.current_status;
          this.response.error = false
        });
      default:
        this.response.error = true
        return {}
    }
  }

  unconfirm(id) {
    this.confirm(id, false)
  }

}
