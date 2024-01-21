import { patientObject } from '@vitiacare/vitiacare_sdk_js/classes/single/patientObject';
import { FileObj } from '@vitiacare/vitiacare_sdk_js/classes/single/file';

export class QuestionAnswer extends patientObject {

  constructor(userId, api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(userId, api_url, api_key);
    this.set_type('question_answer');
    if (rel_id !== null) {
      this.set_relation_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }
}
