import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';

export class ActionFlow extends patientObject {

  constructor(userId, api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('action_flow');
    if (rel_id !== null) {
      this.set_relation_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async postAnswer(ansId, after_load_hook=null ){
    let object_to_create = {ans:ansId}
  await this.send_request('POST', `patient/${this.getPatientId() }/${this.obj_type}/${this.get_id()}`, object_to_create);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then(async (data) => {
          await Object.assign(this.holder, data); 
          await Object.assign(this.value, data);
          this.set_id(this.value._key);
        });
        if(after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        throw this.response.status;
      }  
  }

}
