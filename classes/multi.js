const { vitiaObject } = require('./single');
const { make_request_from_object } = require('../helpers/request');

 class vitiaMultiObject extends vitiaObject{  

  constructor({api_url=null, api_key=null,obj_type="", user_token="", user_id="", search_params={}, file_type=""}={api_url:"", api_key:"",obj_type:"", user_token:"", user_id:"", search_params:{}, file_type:""}){
    super({api_url:api_url, api_key:api_key,obj_type:obj_type, user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
    this.value = [];
    this.holder = [];
    this.limit = 0;
    this.multi = true;
  }
  async create(index=null, obj_to_create=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(Array.isArray(obj_to_create)) {
      if(index === null || isNaN(index)) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
      if(this.value.length <= index) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
      if(this.value[index]._key !== null && this.value[index]._key !== '') return {error: true, error_dec: 'Object exists, did you mean update()?', err_code: this.error_codes.CREATE_EXISTING_OBJECT};
      let atts = obj_to_create.map((e) => e);
      obj_to_create = {};
      atts.forEach((att) => {
        obj_to_create[att] = this.value[index][att];
      });
    } else if(obj_to_create !== null){
      if(index !== null){
        if(isNaN(index)) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
        if(this.value.length <= index) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
        if(this.value[index]._key !== null && this.value[index]._key !== '' && this.value[index]._key !== null && this.value[index]._key !== undefined) return {error: true, error_dec: 'Object exists, did you mean update()?', err_code: this.error_codes.CREATE_EXISTING_OBJECT};
      }
    } else {
      if(index === null || isNaN(index)) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
      if(this.value.length <= index) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
      if(this.value[index]._key !== null && this.value[index]._key !== '' && this.value[index]._key !== null && this.value[index]._key !== undefined) return {error: true, error_dec: 'Object exists, did you mean update()?', err_code: this.error_codes.CREATE_EXISTING_OBJECT};
      obj_to_create = {};
      Object.assign(obj_to_create, this.value[index]);
    }
    status = await this.checkStatus(obj_to_create);
    await Promise.allSettled([status]);
    if(status !== true && status !== 'true') return {error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE};
    let new_obj = new vitiaObject(this.getStore())
    await new_obj.prepare()
    await new_obj.loadSchema();
    return new_obj.create(obj_to_create).then((res) => {
      if(res.error === true) return res;
      if(res.error === false) {
        if(index !== null) {
          if(obj_to_create!== null) Object.assign(this.value[index], obj_to_create);
          this.value[index]._key = res.id;
          Object.assign(this.holder, this.value);
        } else {
          obj_to_create._key = res.id;
          this.value.push(Object.assign(obj_to_create));
          this.holder.push(Object.assign(obj_to_create));
        }
        if(after_load_hook !== null) after_load_hook(this.value[(index === null) ? this.value.length : index]);
        return res;
      }
    });
  }

  async createMulti(list_to_create=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(list_to_create !== null){
      list_to_create = list_to_create;
    } else {
      list_to_create = this.value;
    }
    let prom = list_to_create.map(async (e) => {
      return this.create(null, e, null, after_load_hook)
    });
    Promise.allSettled(prom);
    return prom;
  }

  async loadData(search_params=null, add=false, limit=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() if first?', err_code: this.error_codes.NOT_READY};
    if(search_params === null) return {error: true, error_dec: 'Missing search params', err_code: this.error_codes.NOT_READY};
    if(!Array.isArray(search_params)) this.search_params = [search_params];
    else this.search_params = search_params.map((e) => e);
    let tmp_value = (add===true) ? this.value : [];
    var config;
    let results = this.search_params.map(async (param) => {
      config = {
          baseURL: process.env.apiUrl,
          url: `${this.obj_type}`,
          method: 'POST',
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.api_key}`,
            'UserToken' : this.user_token,
            'UserId' : this.user_id
          },
          data: 
            JSON.stringify({search_params: param, limit: limit})
      }
      let request = make_request_from_object(config);
      return fetch(request).then(async (ans) => {
        switch (ans.status) {
          case 200:
            return ans.json().then(async (data) => {
              await data.filter((e) => !tmp_value.map((e) => e._key).includes(e._key)).forEach((e) => tmp_value.push(e));
              return {error: false};
            });
          default:
            return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
        }
      }).catch(() => "Error!");
    });
    let res = false;
    await Promise.allSettled(results).then((a) => console.log('Done'));
    this.value = tmp_value.map((e) => Object.assign({},e));
    this.holder = tmp_value.map((e) => Object.assign({},e));
    if(after_load_hook !== null) after_load_hook(this.value);
    return {error: res};
  }

  async update(key, obj_to_update=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let index =  this.value.map((e) => e._key).indexOf(key);
    if(index <= 0) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
    if(Array.isArray(obj_to_update)) {
      if(!obj_to_update.includes('_key')) obj_to_update.push('_key');
      let atts = obj_to_update.map((e) => e);
      obj_to_update = {};
      atts.forEach((att) => {
        obj_to_update[att] = this.value.filter((e) => e._key === key)[0][att];
      });
    } else if(obj_to_update !== null){
      if(!Object.keys(obj_to_update).includes('_key')) obj_to_update._key = key;
    } else {
      obj_to_update = {};
      Object.assign(obj_to_update, this.value.filter((e) => e._key === key)[0]);
    }
    status = await this.checkStatus(obj_to_update);
    await Promise.allSettled([status]);
    if(status !== true && status !== 'true') return {error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE};
    let new_obj = new vitiaObject(this.getStore())
    await new_obj.prepare()
    await new_obj.loadSchema();
    return new_obj.update(obj_to_update).then((res) => {
      if(res.error === true) return res;
      if(res.error === false) {
        if(index !== null) {
          if(obj_to_create!== null) Object.assign(this.value[index], obj_to_create);
          this.value[index]._key = res.id;
          Object.assign(this.holder, this.value);
        } else {
          obj_to_create._key = res.id;
          this.value.push(Object.assign(obj_to_create));
          this.holder.push(Object.assign(obj_to_create));
        }
        if(after_load_hook !== null) after_load_hook(this.value[(index === null) ? this.value.length : index]);
        return {error: false, id: res.id};
      }
    });
  }

  async updateMulti(list_to_update=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(Array.isArray(list_to_update)) {
      let keys = list_to_update.map((e) => e);
      list_to_update = this.value.filter((e) => keys.includes(e._key));
    } else if(list_to_update !== null){
      let vals = {};
      Object.assign(vals,list_to_update);
      list_to_update = [];
      Object.entries(vals).forEach((key, value) => {
        if(!Object.keys(value).includes('_key')) value._key = key;
        list_to_update.push(value);
      })
    } else {
      list_to_update = this.value.filter((e) => (e._key !== '' && e._key !== null));
    }
    return list_to_update.map((e) => {
      return {_key: e._key, res: this.update(e._key, null, after_load_hook)}
    });
  }

  async reset(key, attributes=null){
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(this.schema === {}) await this.loadSchema();
    let reset_list = this.schema.map((e) => e);
    let base_obj = Object.assign(this.holder.filter((e) => e._key === key)[0]);
    if(attributes !== null){
      if(Array.isArray(attributes)){
        reset_list = this.schema.filter((e) => attributes.includes(e.name));
      } else if (typeof attributes === 'object') {
        reset_list = this.schema.filter((e) => Object.keys(attributes).includes(e.name));
        base_obj = Object.assign(attributes);
      } else {
        return false;
      } 
    }
    let local_i = this.value.map((e) => e._key).indexOf(key);
    await reset_list.forEach((att) => {
      this.value[local_i][att.name] = base_obj[att.name];
    });
    return true;
  }

  async delete(key, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(this.value.filter((e) => e._key === key).length <= 0) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
    let obj_to_delete = {};
    Object.assign(obj_to_delete, this.value.filter((e) => e._key === key)[0]);
    let config = {
        baseURL: process.env.apiUrl,
        url: `${this.obj_type}`,
        method: 'DELETE',
        headers: this.headers,
        data: JSON.stringify(obj_to_delete),
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          this.value = this.value.filter((e) => e._key !== key);
          this.holder = this.holder.filter((e) => e._key !== key);
          if(after_load_hook !== null) after_load_hook(obj_to_delete);
          return {error: false};
          return {error: false};
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
        }
      }).catch(() => "Error!");
  }

  
}

 class Measurements extends vitiaMultiObject {

  constructor (api_url, api_key,{user_token="", user_id="", search_params={}, file_type=""}={}) {
    super(api_url, api_key, {obj_type:"record_vitals", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"record_vitals", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async lastMeasures(vital_list, user_id=null,conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let userid = (user_id !== null) ? user_id : this.user_id;
    let config = {
        baseURL: this.api_url,
        url: `measurement/latest/${userid}`,
        method: 'POST',
        headers: this.headers,
        data: JSON.stringify({vital_ids:vital_list}),

    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            return {error: false, data: data.last_measure};
          });
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
        }
      }).catch(() => 'Error!');
  }
}

 class Vitals extends vitiaMultiObject {

  constructor (api_url, api_key,{user_token="", user_id="", search_params={}, file_type=""}={}) {
    super(api_url, api_key, {obj_type:"vital", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"vital", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async getBasicVitals(conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let search_params = {basic: true};
    await this.loadData(search_params);
  }
}

 class Relations extends vitiaMultiObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key, obj_type:"relation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"relation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async getRelations(user=null, type='any', conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    var search_params;
    let user_id = (user===null) ? this.user_id : user ;
    if(type === 'in') { 
      search_params= {_to: user_id};
    } else if(type === 'out') {
      search_params= {_from: user_id};
    } else {
      search_params= [{_to: user_id}, {_from: user_id}];
    }
    await this.loadData(search_params);
  }
}

class Users extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"user", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"user", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Referrals extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"invitation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"invitation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class CommunicationPreferences extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"communication_preference", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"communication_preference", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class VitalsPresets extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"vitals_preset", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"vitals_preset", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class FeedbackReports extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"feedback", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"feedback", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class UserTools extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"user_tool", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"user_tool", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Profiles_Status extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"profile_status", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"profile_status", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Intakes extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"intake", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"intake", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }

}

class Treatment_Steps extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"intake_step", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"intake_step", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Intake_Frequencies extends vitiaMultiObject {

  
 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"intake_frequency", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"intake_frequency", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }

 async createMulti(list_to_create=null, conf=null, after_load_hook=null) {
  const { Intake_Frequency } = require('./single');
  if(conf !== null) this.prepare(conf);
  if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
  if(list_to_create !== null){
    list_to_create = list_to_create;
  } else {
    list_to_create = this.value;
  }
  const intake_frequency = new Intake_Frequency()

  for(let i = 0; i < list_to_create.length; i++){
    // intake_frequency.value = Object.assign({},list_to_create[i]);
    // intake_frequency.UTCTimes();
    // list_to_create[i] = Object.assign(list_to_create[i], intake_frequency.value);
    if(!Object.keys(list_to_create[i]).includes('timezone_offset') || list_to_create[i].timezone_offset == undefined || list_to_create[i].timezone_offset == null ) list_to_create[i].timezone_offset = intake_frequency.getTimezoneOffset();
  }

  return super.createMulti(list_to_create, null, after_load_hook)
}
}

class Treatments extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"treatment", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"treatment", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Drugs extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"drug", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"drug", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Prescriptions extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"prescription", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"prescription", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Records extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"record", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"record", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

class Tutorials extends vitiaMultiObject {

 constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
   super({api_url:api_url, api_key:api_key, obj_type:"tutorial", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
 }

 async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
   await super.prepare({obj_type:"tutorial", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
 }
}

module.exports  ={ 
  Vitals,
  Relations,
  Measurements,
  vitiaMultiObject,
  Users,
  Referrals,
  CommunicationPreferences,
  VitalsPresets,
  FeedbackReports,
  UserTools,
  Profiles_Status,
  Intakes,
  Treatment_Steps,
  Intake_Frequencies,
  Treatments,
  Drugs,
  Prescriptions,
  Records,
  Tutorials
}