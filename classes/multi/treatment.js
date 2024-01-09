import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';

export class Treatments extends patientObjects {

  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('treatment');
  }

  async getUserTreatments(date_from=null, date_to=null, options = {}, add = false) {
    var search_params = options;
    let user_id = (user === null) ? this.user_id : user;
    Object.assign(search_params, { _to: user_id });
    if(date_from != null) search_params['start_date'] = date_from;
    if(date_to != null) search_params['end_date'] = date_to;
    await this.loadData(search_params, add);
    return this.value;
  }

  async getPatientTreatmentsFromPrescription(prescription=null, options = {}, add = false) {
    var search_params = options;
    Object.assign(search_params, { prescription:prescription });
    await this.loadData(search_params, add);
    return this.value;
  }
  
  

}