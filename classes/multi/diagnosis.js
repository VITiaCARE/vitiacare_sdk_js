import { patientObjects } from '@vitiacare/vitiacare_sdk_js/classes/multi/patientObjects';

export class Diagnostics extends patientObjects {


  constructor(userId, api_url, api_key) {
    super(userId, api_url, api_key);
    this.set_type('diagnosis');
  }


}