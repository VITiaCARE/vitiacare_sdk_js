import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Referrals extends patientObjects {

  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('referral');
  }


}