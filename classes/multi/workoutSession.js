import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class WorkoutSessions extends patientObjects {

  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('workout_session');
  }

  async getRecords( date_from=null, date_to=null, options = {}, add = false) {
    var search_params = options;
    if(date_from != null) search_params['min_date'] = date_from;
    if(date_to != null) search_params['max_date'] = date_to;
    await this.loadData(search_params, add);
    return this.value;
  }
  

}