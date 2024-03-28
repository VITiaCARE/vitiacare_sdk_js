import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

class patientObject extends vitiaObject{  

  constructor(patientId, api_url, api_key){
    super(api_url, api_key)
    this.setPatientId(patientId)
  }

  setPatientId(patientId) {
    this.patientId=patientId;
    this.set_user_id(patientId);
    
  }
  getPatientId() {
    return this.patientId;
    
  }

  getEvent() {
    return this.eventId;
  }

  getAwards() {
    return this.awards
  }


  setEvent(event) {
    this.eventId = event;
  }

  setAwards(awards) {
    this.awards = awards;
  }

  get_data() {
    let data = super.get_data();
    data.eventId = this.getEvent();
    data.awards = this.getAwards();
    return data;
  }

async loadData(obj_id, after_load_hook=null) {
  await this.send_request('GET', `patient/${this.getPatientId()}/${this.obj_type}/${obj_id}`);
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

  async create(object_to_create, after_load_hook=null ){
    return await this.post(object_to_create, after_load_hook=null)
  }

  async post(object_to_create, after_load_hook=null ){
  await this.send_request('POST', `patient/${this.getPatientId() }/${this.obj_type}`, object_to_create);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then((j) => {
          this.set_id(j.obj_id);
          this.setEvent((j.event_id) ? j.event_id : '');
          this.setAwards((j.awards) ? j.awards : '');
        });
        if(after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        throw this.response.status;
      }  
  }

  async update(id, update_object, after_load_hook=null ){
    await this.send_request('PATCH', `patient/${this.getPatientId()}/${this.obj_type}/${id}`, update_object);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then((j) => Object.assign(this.value, j));
        if(after_load_hook != null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        throw this.response.status;
      }  
  }

  async store(after_load_hook=null){
    if(this.get_id() !== '' && this.get_id() !== null) await this.update(this.get_id(), this.value, after_load_hook);
    else await this.create(this.value, after_load_hook);
  }

  async delete(after_load_hook=null){
    await this.send_request('DELETE', `patient/${this.getPatientId()}/${this.obj_type}/${this.get_id()}`);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        this.value = {}
        this.holder = {}
        this.set_id('')
        if(after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        throw this.response.status;
      }  
  }

}


module.exports = {
  patientObject
}