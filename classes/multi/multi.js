const { vitiaObject } = require('@vitiacare/vitiacare_sdk_js/classes/single/single');
const { make_request_from_object } = require('@vitiacare/vitiacare_sdk_js/helpers/request');
const { Interface } = require('@vitiacare/vitiacare_sdk_js/helpers/interface')

class vitiaMultiObject extends Interface {

  constructor(api_url, api_key) {
    if (api_url === null) {
      try {
        api_url = process.env.api_url;
      } catch {
        api_url = "";
      }
    }
    if (api_key === null) {
      try {
        api_key = process.env.api_key;
      } catch {
        api_key = "";
      }
    }
    super(api_url, `Bearer ${api_key}`)
    this.api_key = api_key;
    this.api_url = api_url;
    this.value = [];
    this.holder = [];
    this.limit = 0;
    this.multi = true;
  }

  get_data(){
    return this.value;
  }
  

  set_type(obj_type) {
    this.obj_type = obj_type;
  }

  set_user_token(user_token) {
    this.user_token = user_token;
    this.update_headers({ 'UserToken': user_token })
  }

  set_location(lat, long) {
    let loc = [lat, long];
    this.update_headers({ 'User-Location': loc })
  }

  set_user_id(user_id) {
    this.user_id = user_id;
    this.update_headers({ 'UserId': user_id })
  }

  set_relation_id(rel_id) {
    this.rel_id = rel_id;
    this.update_headers({ 'Relation-Id': rel_id })
  }

  set_id(obj_id) {
    this.obj_id = obj_id;
    this.value._key = obj_id;
  }

  set_access_token(access_token) {
    this.access_token = {'Access-Token': access_token};
    this.update_headers({'Access-Token': access_token});
  }

  // async create(index = null, obj_to_create = null, conf = null, after_load_hook = null) {
  //   if (conf !== null) this.prepare(conf);
  //   if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
  //   if (Array.isArray(obj_to_create)) {
  //     if (index === null || isNaN(index)) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //     if (this.value.length <= index) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //     if (this.value[index]._key !== null && this.value[index]._key !== '') return { error: true, error_dec: 'Object exists, did you mean update()?', err_code: this.error_codes.CREATE_EXISTING_OBJECT };
  //     let atts = obj_to_create.map((e) => e);
  //     obj_to_create = {};
  //     atts.forEach((att) => {
  //       obj_to_create[att] = this.value[index][att];
  //     });
  //   } else if (obj_to_create !== null) {
  //     if (index !== null) {
  //       if (isNaN(index)) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //       if (this.value.length <= index) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //       if (this.value[index]._key !== null && this.value[index]._key !== '' && this.value[index]._key !== null && this.value[index]._key !== undefined) return { error: true, error_dec: 'Object exists, did you mean update()?', err_code: this.error_codes.CREATE_EXISTING_OBJECT };
  //     }
  //   } else {
  //     if (index === null || isNaN(index)) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //     if (this.value.length <= index) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //     if (this.value[index]._key !== null && this.value[index]._key !== '' && this.value[index]._key !== null && this.value[index]._key !== undefined) return { error: true, error_dec: 'Object exists, did you mean update()?', err_code: this.error_codes.CREATE_EXISTING_OBJECT };
  //     obj_to_create = {};
  //     Object.assign(obj_to_create, this.value[index]);
  //   }
  //   status = await this.checkStatus(obj_to_create);
  //   await Promise.allSettled([status]);
  //   if (status !== true && status !== 'true') return { error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE };
  //   let new_obj = new vitiaObject(this.getStore())
  //   await new_obj.prepare()
  //   await new_obj.loadSchema();
  //   return new_obj.create(obj_to_create).then((res) => {
  //     if (res.error === true) return res;
  //     if (res.error === false) {
  //       if (index !== null) {
  //         if (obj_to_create !== null) Object.assign(this.value[index], obj_to_create);
  //         this.value[index]._key = res.id;
  //         Object.assign(this.holder, this.value);
  //       } else {
  //         obj_to_create._key = res.id;
  //         this.value.push(Object.assign(obj_to_create));
  //         this.holder.push(Object.assign(obj_to_create));
  //       }
  //       if (after_load_hook !== null) after_load_hook(this.value[(index === null) ? this.value.length : index]);
  //       return res;
  //     }
  //   });
  // }

  // async createMulti(list_to_create = null, conf = null, after_load_hook = null) {
  //   if (conf !== null) this.prepare(conf);
  //   if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
  //   if (list_to_create !== null) {
  //     list_to_create = list_to_create;
  //   } else {
  //     list_to_create = this.value;
  //   }
  //   let prom = list_to_create.map(async (e) => {
  //     return this.create(null, e, null, after_load_hook)
  //   });
  //   Promise.allSettled(prom);
  //   return prom;
  // }

  async loadData(search_params, add = true, after_load_hook = null) {
    this.search_params = Object.assign({}, search_params);
    let search_params_string = Object.entries(this.search_params).filter(([k, v]) => k!=null && v!=null).map(([k, v]) => `${k}=${v}`).join('|');
    let tmp_value = (add === true) ? this.value : [];
    await this.send_request('GET', `${this.obj_type}`, {}, { filters: search_params_string });
    switch (this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then(({data}) => data.filter((e) => !tmp_value.map((e) => e._key).includes(e._key)).forEach((e) => tmp_value.push(e)));
        this.value = tmp_value.map((e) => Object.assign({}, e));
        this.holder = tmp_value.map((e) => Object.assign({}, e));
        if (after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;
        throw this.response.status;
    }
  }

  async update(key, obj_to_update = null, after_load_hook = null) {
    let tmp_obj = new vitiaObject(this.api_url, this.api_key);
    tmp_obj.set_type(this.obj_type);
    tmp_obj.set_user_token(this.user_token);
    tmp_obj.set_user_id(this.user_id);
    tmp_obj.set_access_token(this.access_token);
    if (obj_to_update === null) {
      obj_to_update = this.value.filter((v) => v._key === key)[0];
    }
    if ('_key' in obj_to_update) {
      delete obj_to_update._key;
    }
    tmp_obj.update(key, obj_to_update, after_load_hook).then(() => {
      this.value.forEach((v) => {
        if (v._key === key) {
          Object.assign(v, obj_to_update);
        }
      })
    });
  }

  async create(obj_to_update = null, after_load_hook = null) {
    let tmp_obj = new vitiaObject(this.api_url, this.api_key);
    tmp_obj.set_type(this.obj_type);
    tmp_obj.set_user_token(this.user_token);
    tmp_obj.set_user_id(this.user_id);
    tmp_obj.set_access_token(this.access_token);
    if ('_key' in obj_to_update) {
      delete obj_to_update._key;
    }
    tmp_obj.create(obj_to_update, after_load_hook).then(() => {
      this.value.push(tmp_obj.value);
    });
  }

  async delete(key, after_load_hook = null) {
    let tmp_obj = new vitiaObject(this.api_url, this.api_key);
    tmp_obj.set_type(this.obj_type);
    tmp_obj.set_user_token(this.user_token);
    tmp_obj.set_user_id(this.user_id);
    tmp_obj.set_access_token(this.access_token);
    tmp_obj.set_id(key);
    tmp_obj.delete(after_load_hook).then(() => {
      if(tmp_obj.response.error === false) {
        this.value = this.value.filter((v) => v._key !== key)
      }
    });
  }

  //   async update(key, obj_to_update = null, conf = null, after_load_hook = null) {
  //   if (conf !== null) this.prepare(conf);
  //   if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
  //   let index = this.value.map((e) => e._key).indexOf(key);
  //   if (index < 0) return { error: true, error_dec: 'Cannot find object with specified key', err_code: this.error_codes.OBJECT_NOT_FOUND };
  //   if (Array.isArray(obj_to_update)) {
  //     if (!obj_to_update.includes('_key')) obj_to_update.push('_key');
  //     let atts = obj_to_update.map((e) => e);
  //     obj_to_update = {};
  //     atts.forEach((att) => {
  //       obj_to_update[att] = this.value.filter((e) => e._key === key)[0][att];
  //     });
  //   } else if (obj_to_update !== null) {
  //     if (!Object.keys(obj_to_update).includes('_key')) obj_to_update._key = key;
  //   } else {
  //     obj_to_update = {};
  //     Object.assign(obj_to_update, this.value.filter((e) => e._key === key)[0]);
  //   }
  //   status = await this.checkStatus(obj_to_update);
  //   await Promise.allSettled([status]);
  //   if (status !== true && status !== 'true') return { error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE };
  //   let new_obj = new vitiaObject(this.getStore())
  //   await new_obj.prepare()
  //   await new_obj.loadSchema();
  //   return new_obj.update(obj_to_update).then((res) => {
  //     if (res.error === true) return res;
  //     if (res.error === false) {
  //       if (index !== null) {
  //         if (obj_to_create !== null) Object.assign(this.value[index], obj_to_create);
  //         this.value[index]._key = res.id;
  //         Object.assign(this.holder, this.value);
  //       } else {
  //         obj_to_create._key = res.id;
  //         this.value.push(Object.assign(obj_to_create));
  //         this.holder.push(Object.assign(obj_to_create));
  //       }
  //       if (after_load_hook !== null) after_load_hook(this.value[(index === null) ? this.value.length : index]);
  //       return { error: false, id: res.id };
  //     }
  //   });
  // }

  async updateMulti(list_to_update = null, conf = null, after_load_hook = null) {
    if (conf !== null) this.prepare(conf);
    if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
    if (Array.isArray(list_to_update)) {
      let keys = list_to_update.map((e) => e);
      list_to_update = this.value.filter((e) => keys.includes(e._key));
    } else if (list_to_update !== null) {
      let vals = {};
      Object.assign(vals, list_to_update);
      list_to_update = [];
      Object.entries(vals).forEach((key, value) => {
        if (!Object.keys(value).includes('_key')) value._key = key;
        list_to_update.push(value);
      })
    } else {
      list_to_update = this.value.filter((e) => (e._key !== '' && e._key !== null));
    }
    return list_to_update.map((e) => {
      return { _key: e._key, res: this.update(e._key, null, after_load_hook) }
    });
  }

  async reset(key, attributes = null) {
    if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
    if (this.schema == {}) await this.loadSchema();
    let reset_list = this.schema.map((e) => e);
    let base_obj = Object.assign(this.holder.filter((e) => e._key === key)[0]);
    if (attributes !== null) {
      if (Array.isArray(attributes)) {
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


}

class Measurements extends vitiaMultiObject {

  constructor(api_url, api_key, { user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super(api_url, api_key, { obj_type: "record_vitals", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "record_vitals", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }

  async lastMeasures(vital_list, user_id = null, conf = null) {
    if (conf !== null) this.prepare(conf);
    if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
    let userid = (user_id !== null) ? user_id : this.user_id;
    let config = {
      baseURL: this.api_url,
      url: `measurement/latest/${userid}`,
      method: 'POST',
      headers: this.headers,
      data: JSON.stringify({ vital_ids: vital_list }),

    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            return { error: false, data: data.last_measure };
          });
        default:
          return { error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err };
      }
    }).catch(() => 'Error!');
  }
}


class CommunicationPreferences extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "communication_preference", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "communication_preference", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}

class VitalsPresets extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "vitals_preset", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "vitals_preset", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}

class FeedbackReports extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "feedback", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "feedback", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}

class UserTools extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "user_tool", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "user_tool", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}

class Profiles_Status extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "profile_status", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "profile_status", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}

class Treatment_Steps extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "intake_step", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "intake_step", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}



class Tutorials extends vitiaMultiObject {

  constructor({ api_url = "", api_key = "", user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    super({ api_url: api_url, api_key: api_key, obj_type: "tutorial", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type })
  }

  async prepare({ user_token = "", user_id = "", search_params = {}, file_type = "" } = {}) {
    await super.prepare({ obj_type: "tutorial", user_token: user_token, user_id: user_id, search_params: search_params, file_type: file_type });
  }
}

module.exports = {
  Measurements,
  vitiaMultiObject,
  CommunicationPreferences,
  VitalsPresets,
  FeedbackReports,
  UserTools,
  Profiles_Status,
  Treatment_Steps,
  Tutorials
}