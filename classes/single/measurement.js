import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';
import { FileObj } from '@vitiacare/vitiacare_sdk_js/classes/single/file';

export class Measurement extends patientObject {

  constructor(userId, api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('measurement');
    if (rel_id !== null) {
      this.set_relation_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async create(signId, measureDate, measureTime, measureValue, image=null, after_load_hook=null ){
    let object_to_create = {
      sign: signId,
      date: measureDate,
      time: measureTime, 
      value: measureValue
    }
    if(image !== null) {
      let file = new FileObj(this.api_url, this.api_key);
      file.set_user_token(this.get_user_token());
      file.set_user_id(this.user_id);
      file.set_access_token(this.get_access_token());
      file.set_relation_id(this.rel_id);
      await file.create(image, 'measurements', 'private').then( () => object_to_create['file'] = file.get_id());
    }
    console.log(object_to_create)
    await this.post(object_to_create,after_load_hook);
  }


  async measureByName(name, user_id=null, total=1, conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let vital = new Vital();
    vital.prepare(this.getStore());
    vital.findByName(name);
    let userid = (user_id !== null) ? user_id : this.user_id;
    vital_id = vital.value._key;
    return this.lastMeasure(vital_id, userid);
  }

  async lastMeasure(vital_id, user_id=null) {
    let userid = (user_id !== null) ? user_id : this.user_id;
    await this.send_request('GET', `measurement/latest/${userid}/${vital_id}`);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        return await this.response.json().then((last_measure) => {
          this.value = last_measure;
          return last_measure
        });
        break;
      default:
        this.response.error = true;    
        return {}
        break;
      }
  }

}
