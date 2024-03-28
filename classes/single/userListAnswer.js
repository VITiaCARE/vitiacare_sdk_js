import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';
import { FileObj } from '@vitiacare/vitiacare_sdk_js/classes/single/file';

export class UserListAnswer extends patientObject {

  constructor(userId, api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('userlist_answer');
    if (rel_id !== null) {
      this.set_relation_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async create(userlistId, date, time, items, context='', after_load_hook=null ){
    return this.postAnswer(userlistId, date, time, items, context, after_load_hook)
  }

  async postAnswer(userlistId, date, time, items, context='', after_load_hook=null ){
    let object_to_create = {
      userlistId: userlistId,
      date: date,
      time: time, 
      items: items,
      answer_context: context
    }
    await this.post(object_to_create,after_load_hook);
  }
}
