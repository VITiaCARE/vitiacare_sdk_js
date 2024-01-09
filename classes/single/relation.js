import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';

export class Relation extends patientObject {

  constructor(userId, api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('relation');
    if (rel_id !== null) {
      this.set_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  
  async confirm(id = null, mode = true) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('POST', `patient/${this.getPatientId()}/relation/${obj_id}/confirm`, { 'mode': mode });
    switch (this.response.status) {
      case 200:
        this.response.error = false
        await this.response.json().then(r => this.value.confirmed = r.current_status)
        
      default:
        this.response.error = true
    }
  }

  unconfirm(id = null) {
    this.confirm(id, false)
  }


  async notify(id = null) {
    let obj_id = (id !== null) ? id : this.obj_id;
    await this.send_request('POST', `patient/${this.getPatientId()}/relation/${obj_id}/notify`, {});
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
