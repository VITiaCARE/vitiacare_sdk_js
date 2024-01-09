import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

export class FileObj extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('file');
    if (rel_id !== null) {
      this.set_relation_id(rel_id);
    }
    if (access_token !== null) this.set_access_token(access_token);
  }

  async create(file=null, source='file', realm='private', after_load_hook=null ){
    let fileData = {};
    fileData.source =source;
    fileData.realm=realm;
    fileData.file=file;
    await this.send_request('POST', `${this.obj_type}`, fileData,{},null);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then((j) => this.set_id(j.obj_id));
        if(after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        break;
      }  
  }
  
  async getFileUrl(fileID = null) {
    let fileIdFull = (fileID === null) ? this.get_id() : fileID;
    await this.send_request('GET', `file/${fileIdFull}/uri`);  
    switch (this.response.status) {
      case 200:
        this.response.error = false
        return this.response.json().then(async (data) => {
          return data.uri;
        });
      default:
        this.response.error = true
        return null
      }
  }


}
