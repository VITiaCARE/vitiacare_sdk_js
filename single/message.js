import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';
import { toUTCDateFromISO } from '@vitiacare/vitiacare_sdk_js/helpers/datetime';

export class Message extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('message');
    if (rel_id !== null) {
      this.set_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async create(object_to_create, after_load_hook=null ){
    Object.assign(object_to_create, {from: this.get_user_id()})
    super.create(object_to_create, after_load_hook);
  }
  
  async send(from, to, content){
    return this.create({from, to, content}).then(() => true).catch(() => false);
  }
}
