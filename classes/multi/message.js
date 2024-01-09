import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Messages extends patientObjects {

  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('message');
  }

  async get(counterpartId, startDate=null, endDate=null){
    return await this.loadData({counterpart_id:counterpartId, min_date:startDate, max_date:endDate }, true).then(() => this.get_data()).catch(() => []);
  }


}