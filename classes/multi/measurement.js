import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Measurements extends patientObjects {

  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('measurement');
  }

  async getPatientMeasurements(date_from=null, date_to=null, limit=null, sorting=null, vitalId=null, page_size=null, options = {}, add = false, after_load_hook=null) {
    var search_params = options;
    if(date_from != null) search_params['min_date'] = date_from;
    if(date_to != null) search_params['max_date'] = date_to;
    if(vitalId != null) search_params['vitalId'] = vitalId;
    await this.loadData(search_params, add, after_load_hook, limit, sorting, page_size);
    return this.value;
  }

  

}