import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';
import { toUTCDateFromISO } from '../../helpers/datetime';

export class Purchase extends patientObject {


  constructor(userId, api_url = null, api_key = null, intake_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('purchase');
    if (intake_id !== null) {
      this.set_id(intake_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }


}
