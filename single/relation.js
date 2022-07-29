import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Relation extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('relation');
    if (rel_id !== null) {
      this.set_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async loadData(obj_id, after_load_hook=null) {
    await super.loadData(obj_id);
    if(this.value._from === this.user_id){
      Object.assign(this.value, {related_user:this.value.obj_to, direction: 'out'})
    } else {
      Object.assign(this.value, {related_user:this.value.obj_from, direction: 'in'})
    }
    if(after_load_hook !== null) after_load_hook(this.value);
  }
  
  async confirm(id = null, mode = true) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('POST', `confirm_relation/${obj_id}`, { 'mode': mode });
    switch (this.response.status) {
      case 200:
        this.response.error = false
        this.value.confirmed = mode;
      default:
        this.response.error = true
    }
  }

  unconfirm(id = null) {
    this.confirm(id, false)
  }
  
  async delete(id) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('DELETE', `relation/${obj_id}`);
    switch (this.response.status) {
      case 200:
        this.response.error = false
      default:
        this.response.error = true
    }
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
