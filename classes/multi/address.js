import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';
import { Intake } from '@vitiacare/vitiacare_sdk_js/classes/single/intake';

export class Addresses extends patientObjects {

  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('address');
  }



}