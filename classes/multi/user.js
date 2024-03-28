import { vitiaMultiObject } from '@vitiacare/vitiacare_sdk_js/classes/multi/multi';

export class Users extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('user');
  }
}