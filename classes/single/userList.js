import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

export class UserList extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('userlist');
    if (access_token !== null) this.set_access_token(access_token);
  }

}
