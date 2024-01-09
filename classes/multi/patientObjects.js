import { vitiaMultiObject } from '@vitiacare/vitiacare_sdk_js/classes/multi/multi';
import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';

class patientObjects extends vitiaMultiObject {


  constructor(patientId, api_url, api_key){
    super(api_url, api_key);
    this.setPatientId(patientId);
  }

  setPatientId(patientId) {
    this.patientId=patientId;
    
  }
  getPatientId() {
    return this.patientId;
    
  }
  setEvent(event) {
    this.eventId = event;
  }

  setAwards(awards) {
    this.awards = awards;
  }



  async loadData(search_params, add = true, after_load_hook = null, limit=null, sorting=null, page_size=null, page=null) {
    this.search_params = Object.assign({}, search_params);
    let search_params_string = Object.entries(this.search_params).filter(([k, v]) => k!=null && v!=null).map(([k, v]) => `${k}=${v}`).join('|');
    let tmp_value = (add === true) ? this.value : [];
    let req_params = { filters: search_params_string }
    if( limit != null) req_params['limit'] = limit
    if( sorting != null) req_params['sort_by'] = sorting
    if( page != null) req_params['page_num'] = page
    if( page_size != null) req_params['page_size'] = page_size

    await this.send_request('GET', `patient/${this.getPatientId()}/${this.obj_type}`, {}, req_params);
    switch (this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then(({data}) => data.filter((e) => !tmp_value.map((e) => e._key).includes(e._key)).forEach((e) => tmp_value.push(e)));
        this.value = tmp_value.map((e) => Object.assign({}, e));
        this.holder = tmp_value.map((e) => Object.assign({}, e));
        if (after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;
        throw this.response.status;
    }
  }

  async update(key, obj_to_update = null, after_load_hook = null) {
    let tmp_obj = new patientObject(this.getPatientId(), this.api_url, this.api_key);
    tmp_obj.set_type(this.obj_type);
    tmp_obj.set_user_token(this.user_token);
    tmp_obj.set_access_token(this.access_token);
    if (obj_to_update === null) {
      obj_to_update = this.value.filter((v) => v._key === key)[0];
    }
    if ('_key' in obj_to_update) {
      delete obj_to_update._key;
    }
    tmp_obj.update(key, obj_to_update, after_load_hook).then(() => {
      this.value.forEach((v) => {
        if (v._key === key) {
          Object.assign(v, obj_to_update);
        }
      })
    });
  }

  async create(obj_to_update = null, after_load_hook = null){
    return this.post(obj_to_update, after_load_hook);
  }

  async post(obj_to_update = null, after_load_hook = null) {
    let tmp_obj = new patientObject(this.getPatientId(), this.api_url, this.api_key);
    tmp_obj.set_type(this.obj_type);
    tmp_obj.set_user_token(this.user_token);
    tmp_obj.set_access_token(this.access_token);
    if ('_key' in obj_to_update) {
      delete obj_to_update._key;
    }
    tmp_obj.create(obj_to_update, after_load_hook).then(() => {
      this.value.push(tmp_obj.value);
    });
  }

  async delete(key, after_load_hook = null) {
    let tmp_obj = new patientObject(this.getPatientId(), this.api_url, this.api_key);
    tmp_obj.set_type(this.obj_type);
    tmp_obj.set_user_token(this.user_token);
    tmp_obj.set_access_token(this.access_token);
    tmp_obj.set_id(key);
    tmp_obj.delete(after_load_hook).then(() => {
      if(tmp_obj.response.error === false) {
        this.value = this.value.filter((v) => v._key !== key)
      }
    });
  }
}
module.exports = {
  patientObjects
}