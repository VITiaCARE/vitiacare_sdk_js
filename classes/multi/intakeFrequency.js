import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';

export class IntakeFrequencies extends patientObjects {

  constructor(userId, treatmentId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type(`treatment/${treatmentId}/intake_frequency`);
  }

  async getUserPrescriptions(doctorId=null, date_from=null, date_to=null, options = {}, add = false) {
    var search_params = options;

    if(date_from != null) search_params['start_date'] = date_from;
    if(date_to != null) search_params['end_date'] = date_to;
    if(date_to != null) search_params['doctor_id'] = doctorId;
    await this.loadData(search_params, add);
    return this.value;
  }
  

}