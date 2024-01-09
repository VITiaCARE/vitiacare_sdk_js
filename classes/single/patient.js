import {User } from '@vitiacare/vitiacare_sdk_js/classes/single/user';

export class Patient extends User {

    constructor (api_url=null, api_key=null, patient_id=null, patient_token=null) {
      super(api_url, api_key, patient_id,patient_token);
      this.set_type('patient');
      if(patient_id!==null) {
        this.set_patient_id(patient_id);
      }
      if(patient_token!==null) this.set_user_token(patient_token);
    }
  
    set_id(id) {
      super.set_id(id);
    }
  
    set_patient_id(patient_id){
      this.patient_id = patient_id;
      super.set_user_id(patient_id);
    }
  
    async lastMeasure(vital_id, patient_id=null) {
      let patientid = (patient_id !== null) ? patient_id : this.patient_id;
      await this.send_request('GET', `measurement/latest/${patientid}/${vital_id}`);    
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data.last_measure;
          });
        default:
          this.response.error = true
          return {}
        }
    }
  
    async lastMeasures(vital_list, patient_id=null) {
      let patientid = (patient_id !== null) ? patient_id : this.patient_id;
      await this.send_request('GET', `measurement/latest/${patientid}`,{},{vital_ids:vital_list.join(",")});
        switch (this.response.status) {
          case 200:
            return this.response.json().then(async (data) => {
              this.response.error = false
              return data.last_measure;
            });
          default:
            this.response.error = true
            return []
          }
    }
  
    async getTasks(patient_id=null, tasksType = 'tasks', limit=3){
      let patientid = (patient_id !== null) ? patient_id : this.patient_id;

      await this.send_request('GET', `patient/${patientid}/routines`, {}, {total:limit, routines_type:tasksType});
      switch (this.response.status) {
        case 200:
          return this.response.json().then(async (data) => {
            return data;
          })
        default:
          this.response.error = true
          return [];
        }
  
    }
  
    async getCheckoutLink(type='stripe', order){

      await this.send_request('POST', `shopping/checkout/${type}`, order);
      switch (this.response.status) {
        case 200:
          return this.response.json().then(async (data) => {
            return data;
          })
        default:
          this.response.error = true
          return '';
        }
  
    }
  
  }
  
