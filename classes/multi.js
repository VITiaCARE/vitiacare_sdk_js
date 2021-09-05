
import axios from 'axios';
import { vitiaObject } from '~/d20Commons/classes/object.service';


export class vitiaMultiObject extends vitiaObject{  
  value = [];
  holder = [];
  limit = 0;
  multi = true;

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
    console.log(obj_to_create);
    status = await this.checkStatus(obj_to_create);
    await Promise.allSettled([status]);
    if(status !== true && status !== 'true') return {error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE};
    this.config = {
        baseURL: process.env.apiUrl,
        url: `${this.obj_type}`,
        method: 'PUT',
        headers: this.headers,
        data: JSON.stringify(obj_to_create),
    }
    return axios.request(this.config)
    .then(async (data) => {
      if(index !== null) {
        if(obj_to_create!== null) Object.assign(this.value[index], obj_to_create);
        this.value[index]._key = data.data.o_id;
        Object.assign(this.holder, this.value);
      } else {
        obj_to_create._key = data.data.o_id;
        this.value.push(Object.assign(obj_to_create));
        this.holder.push(Object.assign(obj_to_create));
      }
      if(after_load_hook !== null) after_load_hook(this.value[(index === null) ? this.value.length : index]);
      return {error: false, id: data.data.o_id};
    }, (err) => {
      return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
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
    return list_to_create.map((e) => {
      return {res: this.create(null, e, null, after_load_hook)}
    });
  }

  async loadData(search_params=null, add=false, limit=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() if first?', err_code: this.error_codes.NOT_READY};
    if(search_params === null) return {error: true, error_dec: 'Missing search params', err_code: this.error_codes.NOT_READY};
    if(!Array.isArray(search_params)) this.search_params = [search_params];
    else this.search_params = search_params.map((e) => e);
    let tmp_value = (add===true) ? this.value : [];
    let ans = this.search_params.map(async (param) => {
      this.config = {
          baseURL: process.env.apiUrl,
          url: `${this.obj_type}`,
          method: 'POST',
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token_bearer}`,
            'UserToken' : this.user_token,
            'UserId' : this.user_id
          },
          data: 
            JSON.stringify({search_params: param, limit: limit})
      }
      return axios.request(this.config)
      .then(async (data) => {
        await data.data.filter((e) => !tmp_value.map((e) => e._key).includes(e._key)).forEach((e) => tmp_value.push(e));
        return {error: false};
      }, (err) => {
        return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
      });
    });
    let res = false;
    await Promise.allSettled(ans).then((a) => console.log('Done'));
    this.value = tmp_value.map((e) => Object.assign({},e));
    this.holder = tmp_value.map((e) => Object.assign({},e));
    if(after_load_hook !== null) after_load_hook(this.value);
    return {error: res};
  }

  async update(key, obj_to_update=null, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(this.value.filter((e) => e._key === key).length <= 0) return {error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND};
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
    this.config = {
        baseURL: process.env.apiUrl,
        url: `${this.obj_type}`,
        method: 'PATCH',
        headers: this.headers,
        data: JSON.stringify(obj_to_update),
    }
    return axios.request(this.config)
    .then(async (data) => {
      let local_i = this.value.map((e) => e._key).indexOf(key);
      if(obj_to_update!== null) Object.assign(this.value[local_i], obj_to_update);
      Object.assign(this.holder[local_i], this.value[local_i]);
      if(after_load_hook !== null) after_load_hook(this.value[local_i]);
      return {error: false};
    }, (err) => {
      return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
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
    this.config = {
        baseURL: process.env.apiUrl,
        url: `${this.obj_type}`,
        method: 'DELETE',
        headers: this.headers,
        data: JSON.stringify(obj_to_delete),
    }
    return axios.request(this.config)
    .then(async (data) => {
      this.value = this.value.filter((e) => e._key !== key);
      this.holder = this.holder.filter((e) => e._key !== key);
      if(after_load_hook !== null) after_load_hook(obj_to_delete);
      return {error: false};
    }, (err) => {
      return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
    });
  }

  
}

export class Measurements extends d20ObjectService {
  async prepare (store) {
    super.prepare({obj_type:'record_vital'}, store);
  }

  async lastMeasures(vital_list, user_id=null,conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let userid = (user_id !== null) ? user_id : this.user_id;
    this.config = {
        baseURL: process.env.apiUrl,
        url: `measurement/latest/${userid}`,
        method: 'POST',
        headers: this.headers,
        data: JSON.stringify({vital_ids:vital_list}),

    }
    return await axios.request(this.config)
    .then(async (data) => {
      return {error: false, data: data.data.last_measure};
    }, (err) => {
      return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
    });
  }
}

export class Vitals extends d20MultiObjectService {
  async prepare (store) {
    super.prepare({obj_type:'vital'}, store);
  }

  async getBasicVitals(conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let search_params = {basic: true};
    await this.loadData(search_params);
  }
}

export class Relations extends d20MultiObjectService {
  async prepare (store) {
    super.prepare({obj_type:'relation'}, store);
  }

  async getRelations(user=null, type='any', conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    var search_params;
    let user_id = (user===null) ? this.user_id : user ;
    if(type == 'in') { 
      search_params= {_to: user_id};
      await this.loadData(search_params);
    } else if(type == 'out') {
      search_params= {_from: user_id};
      await this.loadData(search_params);
    } else {
      search_params= [{_to: user_id}, {_from: user_id}];
      await this.loadData(search_params);
    }
  }
}