import { vitiaObject } from './single';
import { toUTCDateFromISO } from '../../helpers/datetime';

export class Intake extends vitiaObject {

  constructor(api_url = null, api_key = null, intake_id = null, access_token = null) {
    super(api_url, api_key);
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
  

  async confirm(id = null, mode = true) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('POST', `confirm_intake/${obj_id}`, { 'mode': mode });
    switch (this.response.status) {
      case 200:
        this.response.error = false
        this.value.taken = mode;
      default:
        this.response.error = true
        return {}
    }
  }

  unconfirm(id) {
    this.confirm(id, false)
  }

}
