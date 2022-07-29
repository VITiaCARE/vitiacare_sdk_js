import { vitiaMultiObject } from './multi';
import { toUTCDateFromISO } from '../../helpers/datetime';

export class Relations extends vitiaMultiObject {

  constructor(api_url, api_key) {
    super(api_url, api_key);
    this.set_type('relation');
  }

  async loadData(search_params, add=true, after_load_hook = null) {
    await super.loadData(search_params, add);
    for(var i = 0; i < this.value.length; i++){
        if(this.value[i]._from === this.user_id){
          Object.assign(this.value[i], {related_user:this.value[i].obj_to, direction: 'out'})
        } else {
          Object.assign(this.value[i], {related_user:this.value[i].obj_from, direction: 'in'})
        }
    }
    if(after_load_hook !== null) await after_load_hook(this.value);
    return this.value;
  }

  async getRelations(user = null, type = 'any') {
    var search_params;
    let user_id = (user === null) ? this.user_id : user;
    this.user_id = user_id;
    if (type === 'in') {
      search_params = { _to: user_id };
    } else if (type === 'out') {
      search_params = { _from: user_id };
    } else {
      search_params = { _to: user_id , _from: user_id };
    }
    await this.loadData(search_params, false);
    return this.value;
  }
  
  async confirm(id, mode = true) {
    let obj_id = id;
    await this.send_request('POST', `confirm_relation/${obj_id}`, { 'mode': mode });
    switch (this.response.status) {
      case 200:
        this.response.error = false
      default:
        this.response.error = true
        return {}
    }
  }

  unconfirm(id) {
    this.confirm(id, false)
  }
  
  async delete(id) {
    let obj_id = id;
    await this.send_request('DELETE', `relation/${obj_id}`);
    switch (this.response.status) {
      case 200:
        this.response.error = false
      default:
        this.response.error = true
    }
  }

  async notify(id) {
    let obj_id = id;
    await this.send_request('POST', `relation/${obj_id}/sendInvite`, {});
    switch (this.response.status) {
      case 200:
        this.response.error = false
        return await this.response.json().then(r => r.res);
      default:
        this.response.error = true
        return false
    }
  }

}