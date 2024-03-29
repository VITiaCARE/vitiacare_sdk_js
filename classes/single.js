const { make_request_from_object } = require('../helpers/request');
const { getLocation } = require('../functions/user_properties')

class vitiaObject {  

  constructor({api_url=null, api_key=null,obj_type="", user_token="", user_id="", search_params={}, file_type=""}={api_url:null, api_key:null,obj_type:"", user_token:"", user_id:"", search_params:{}, file_type:""}){
    if(api_url===null) {
      try {
        api_url=process.env.api_url;
      }catch {
        api_url="";
      }
    }
    if(api_key===null) {
      try {
        api_key=process.env.api_key;
      }catch {
        api_key="";
      }
    }
    return this.initialize({api_url:api_url, api_key:api_key,obj_type:obj_type, user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  initialize ({api_url, api_key,obj_type="", user_token="", user_id="", search_params={}, file_type=""}) {
    this.error_codes = {
      NOT_READY: 1,
      REQUEST_ERROR: 2,
      ATTRIBUTE_LOAD_ERROR: 3,
      NO_FILE_SPECIFIED: 4,
      MISSING_SEARCH_ID: 5,
      INVALID_STATE: 6,
      SINGLE_UPDATE_ON_MULTIPLE: 7,
      OBJECT_NOT_FOUND: 8,
      SINGLE_CREATE_ON_MULTIPLE: 9,
      CREATE_EXISTING_OBJECT: 10,
    };
    this.value = {};
    this.holder = {};
    this.schema = [];
    this.schema_options = {};
    this.status = {}
    this.attributes = {};
    this.staged_changes = {};
    this.stagging = false;
    this.multi = false;

    this.api_url = api_url;  
    this.api_key = api_key;  
    this.obj_type = obj_type;  
    this.user_token = user_token;  
    this.user_id = user_id;  
    this.search_params = search_params;  
    this.file_type = file_type;
  }

  async prepare ({obj_type="", user_token="", user_id="", search_params={}, file_type=""} = {}, options={}) {
    this.user_token = (user_token!=="") ? user_token : this.user_token;
    this.user_id = (user_id!=="") ? user_id : this.user_id;
    this.obj_type = (obj_type!=="") ? obj_type : this.obj_type;
    this.file_type = (file_type!=="") ? file_type : this.file_type;
    this.search_params = (search_params!=={}) ? search_params : this.search_params;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.api_key}`,
      'UserToken' : this.user_token,
      'UserId' : this.user_id,
      'User-Location' : null
      };
    this.ready = true;
    // if(!options.skipLocation || options.skipLocation !== True) getLocation().then((user_location) => this.headers['User-Location'] = user_location);
    return this.ready;
  }
   
  getStore(){
    return {
      api_url:this.api_url,
      api_key:this.api_key,
      user_token:this.user_token,
      user_id:this.user_id,
      obj_type:this.obj_type,
      file_type:this.file_type,
      search_params:this.search_params
    }
  }

  async test () {
    let config = {
      baseURL: this.api_url,
      url: 'test',
      method: 'GET',
      headers: this.headers,
    }
    const request = make_request_from_object(config);
    let resp = await fetch(request).then((ans) => {
      switch (ans.status) {
        case 200:
          return ans.json();
        default:
          console.debug(ans)
          return `HTTP Error: ${ans.status}`  
      }
    }).catch(() => "Error!");
    return resp;
  }

  getSchema(){
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    return this.schema;
  }

  async loadSchema(conf=null, after_load_hook=null){
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let config = {
        baseURL: this.api_url,
        url:  `scheme/${this.obj_type}`,
        method: 'GET',
        headers: this.headers,
    };
    const request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          this.schema = await ans.json().then((d) => d.schema.map((e) => e));
          if(after_load_hook !== null) after_load_hook(this.schema);
          return {error: false};
        default:
          console.debug(ans)
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans}; 
      }
    }).catch(() => "Error!");
  }

  async loadAttributes(conf=null, after_load_hook=null){
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let res = true;
    let prom ={};
    let promises = [];
    let tmp_attributes = {};
    var request;
    this.schema.filter((e) => e.type==='options').forEach((e) => {
      if (e.options.type==='fixed') {
        this.attributes[e.name] = e.options.detail;
      } else {
        let a = Object.assign({}, this.value);
        let p = Object.assign(a, e.options);
        let config = {
            baseURL: this.api_url,
            url:  `schemeoptions`,
            method: 'POST',
            headers: this.headers,
            data: JSON.stringify(p),
        };
        request = make_request_from_object(config);
        prom = fetch(request).then(async (ans) => {
          switch (ans.status) {
            case 200:
              this.attributes[e.name] = await ans.json().then((d) => d.options.map((e) => e));
              break;
            default:
              console.debug(ans)
          }
        }).catch(() => "Error!");
        promises.push(prom);
      }
    });
    await Promise.allSettled(promises);
    if(after_load_hook !== null) after_load_hook(this.attributes);
    if(res){
      return {error: false};
    } else {
      return {error: true, error_dec: 'Some attributes may have not loaded', err_code: this.error_codes.ATTRIBUTE_LOAD_ERROR};
    }
  }

  async create(obj_to_create=null, conf=null, after_load_hook=null) {
    if(this.multi === true) return {error: true, error_dec: 'Did you mean createMulti()?', err_code: this.error_codes.SINGLE_CREATE_ON_MULTIPLE};
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let status = await this.checkStatus(obj_to_create);
    await Promise.allSettled([status]);
    if(status !== true && status !== 'true') return {error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE};
    if(Array.isArray(obj_to_create)) {
      let atts = obj_to_create.map((e) => e);
      obj_to_create = {};
      atts.forEach((att) => {
        obj_to_create[att] = this.value[att];
      });
    } else if(obj_to_create === null){
      obj_to_create = {};
      Object.assign(obj_to_create, this.value);
    }
    let config = {
        baseURL: this.api_url,
        url: `${this.obj_type}`,
        method: 'PUT',
        headers: this.headers,
        data: JSON.stringify(obj_to_create),
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          let data = await ans.json();
          if(obj_to_create!== null) Object.assign(this.value, obj_to_create);
          this.value._key = data.o_id;
          Object.assign(this.holder, this.value);
          this.stagging = false;
          if(after_load_hook !== null) after_load_hook(this.value);
          return {error: false, id: data.o_id, data: data};
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
      }
    }).catch(() => "Error!");
  }

  async loadData({obj_id}, conf=null, after_load_hook=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let config = {
      baseURL: this.api_url,
      url: `${this.obj_type}/${obj_id}`,
      method: 'GET',
      headers: this.headers,
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            Object.assign(this.holder, data); 
            Object.assign(this.value, data);
            if(after_load_hook !== null) after_load_hook(this.value);
            return {error: false};
          });
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
        }
      }).catch(() => "Error!");
  }

  async update(obj_to_update=null, conf=null, after_load_hook=null) {
    if(this.multi === true) return {error: true, error_dec: 'Did you mean updateMulti()?', err_code: this.error_codes.SINGLE_UPDATE_ON_MULTIPLE};
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    status = await this.checkStatus(obj_to_update);
    await Promise.allSettled([status]);
    if(status !== true && status !== 'true') return {error: true, error_dec: 'Cannot store object with invalid state', err_code: this.error_codes.INVALID_STATE};
    if(Array.isArray(obj_to_update)) {
      if(!obj_to_update.includes('_key')) obj_to_update.push('_key');
      let atts = obj_to_update.map((e) => e);
      obj_to_update = {};
      atts.forEach((att) => {
        obj_to_update[att] = this.value[att];
      });
    } else if(obj_to_update !== null){
      if(!Object.keys(obj_to_update).includes('_key')) obj_to_update._key = this.value._key;
    } else {
      obj_to_update = {};
      Object.assign(obj_to_update, this.value);
    }
    let config = {
        baseURL: this.api_url,
        url: `${this.obj_type}`,
        method: 'PATCH',
        headers: this.headers,
        data: JSON.stringify(obj_to_update),
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          if(obj_to_update!== null) Object.assign(this.value, obj_to_update);
          Object.assign(this.holder, this.value);
          this.stagging = false;
          if(after_load_hook !== null) after_load_hook(this.value);
          return {error: false, id: this.value._key};
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
        }
      }).catch(() => "Error!");
  }

  async delete(obj_to_delete=null, conf=null, after_load_hook=null) {
    if(this.multi === true) return {error: true, error_dec: 'Did you mean updateMulti()?', err_code: this.error_codes.SINGLE_UPDATE_ON_MULTIPLE};
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(obj_to_delete !== null){
      if(!Object.keys(obj_to_delete).includes('_key')) return {error: true, error_dec: 'Key for deletion not found', err_code: this.error_codes.OBJECT_NOT_FOUND};
    } else {
      obj_to_delete = {};
      Object.assign(obj_to_delete, this.value);
    }
    let config = {
        baseURL: this.api_url,
        url: `${this.obj_type}`,
        method: 'DELETE',
        headers: this.headers,
        data: JSON.stringify(obj_to_delete),
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          if(after_load_hook !== null) after_load_hook(obj_to_delete);
          return {error: false};
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
        }
      }).catch(() => "Error!");
  }

  async reset(attributes=null){
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(this.schema === []) await this.loadSchema();
    let reset_list = this.schema.map((e) => e);
    let base_obj = Object.assign(this.holder);
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
    await reset_list.forEach((att) => {
      this.value[att.name] = base_obj[att.name];
    });
    return true;
  }

  async checkStatus(attributes=null) {
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(this.schema === []) await this.loadSchema();
    let validation_list = this.schema.filter((e) => this.conditionalDisplay(e.conditional));
    let compare_obj = Object.assign(this.value);
    let val_type = 'global';
    let valid_state = null;
    if(attributes !== null){
      if(Array.isArray(attributes)){
        validation_list = this.schema.filter((e) => attributes.includes(e.name) && this.conditionalDisplay(e.conditional));
        val_type = 'partial';
      } else if (typeof attributes === 'object') {
        validation_list = this.schema.filter((e) => Object.keys(attributes).includes(e.name) && this.conditionalDisplay(e.conditional));
        compare_obj = Object.assign(attributes);
        val_type = 'external';
      } else {
        return false;
      } 
    } else {
      this.stagging = false;
    }
    let validations = validation_list.map(async (att) => {
      let ires = false;
      if(['global', 'partial'].includes(val_type)) {
        this.stagging = this.stagging || compare_obj[att.name] !== this.holder[att.name];
        this.staged_changes[att.name] = compare_obj[att.name] !== this.holder[att.name];
        if (this.staged_changes[att.name] || !Object.keys(this.status).includes(att.name)){
          valid_state = await this.validate(att, compare_obj[att.name]);
        }
        ires = (this.status[att.name].valid !== false);
      } else {
        valid_state = await this.validate(att, compare_obj[att.name], false);
        await Promise.allSettled([valid_state]);
        ires = (valid_state.valid !== false);
      }
      return ires;
    });
    return Promise.allSettled(validations)
      .then((val) => {
        return !(val.map((e) => e.value).includes(false) || val.map((e) => e.value).includes('false'));
      });
  }

  conditionalDisplay(condition, ref_obj=null, eval_obj=null){
    let res = true;
    if (condition && condition !== null){
      if(eval_obj === null) {
        eval_obj = {};
        Object.assign(eval_obj, this.value);
      }
      res = false;
      switch (condition.cond) {
        case 'eq':
          res = (eval_obj[condition.dim] === condition.dim_value);
          break;
        case 'in':
          res = condition.dim_value.includes(eval_obj[condition.dim]);
          break;
        case 'neq':
          res = (eval_obj[condition.dim] !== condition.dim_value);
          break;
        case 'nnull':
          res = (eval_obj[condition.dim] && eval_obj[condition.dim] !== null);
          break;
        case 'char':
          if (ref_obj !== null && Object.keys(ref_obj).includes(condition.char)) {
            res = ref_obj[condition.char] === condition.char_value;
          } else {
            res = false;
          }
          break;
        default:
          res = false;
          break;
      }
    }
    return res;
  }

  async validate(att, val, store=true) {
    let errlabel = '';
    let valid = null;
    if (att.required != true
      && att.unique != true
      && (att.validation == null || att.validation == '')) valid = null;
    else valid = true;
    if(att.required === true){
      valid = (val !== null && val !== '' && val !== undefined);
    }
    if(att.subtype === 'number' && att.type !== 'range') {
      if(!isNaN(val) && !isNan(Number(val))) {
        val = Number(val)
      } else {
        valid = false;
        val = null;
        errlabel += '<p>El valor debe ser numérico.</p>';
      }
    }
    if(this.multi === false && val !== null && val !== '' && val !== this.holder[att.name] && att.unique === true){
      let p={};
      p.dim = att._key;
      p.val = val;
      let config = {
          baseURL: process.env.baseUrl,
          url:  `exists`,
          method: 'POST',
          headers: this.headers,
          data: JSON.stringify(p),
      };
      let request = make_request_from_object(config);
      [valid,errlabel] = await fetch(request).then((ans) => {
        switch (ans.status) {
          case 200:
            return ans.json().then((data) => {
              valid = !data.exists && valid;
              if (data.exists) errlabel += '<p>Ya se encuentra registrado</p>';
              return [valid,errlabel];
            });
          default:
            return [false, '<p>Error al validar</p>'];
          }
        }).catch(() => [false, '<p>Error al validar</p>']);
    }
    let ageDifMs = null;
    let ageDate = null;
    let age = null;
    let time = null;
    let regex = null;
    if(val !== null && val !== undefined){
      switch (att.subtype) {
        case 'email':
          regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
          valid = valid && (val.search(regex) >= 0);
          if (val && val !== null && val.search(regex) < 0) errlabel += '<p>El correo electrónico no es válido.</p>';
          break;
        case 'tel':
          regex = /^\+{0,1}[0-9]+$/g;
          valid = valid && (val.search(regex) >= 0);
          if (val && val !== null && val.search(regex) < 0) errlabel += '<p>Sólo 10 números.</p>';
          break;
      }
      switch (att.validation) {
        case 'alphanum':
          regex = /[^a-zA-Z0-9]/gi;
          valid = valid && (val.search(regex) < 0);
          if (val && val !== null && val.search(regex) >= 0) errlabel += '<p>Debe contener solo letras y números.</p>';
          break;
        case 'age':
          ageDifMs = Date.now() - Date.parse(val);
          ageDate = new Date(ageDifMs); // miliseconds from epoch
          age = Math.abs(ageDate.getUTCFullYear() - 1970);
          if (age < 18){
            valid = false;
            errlabel += '<p>La fecha corresponde a un menor de edad.</p>';
          }
          break;
        case 'underage':
          ageDifMs = Date.now() - Date.parse(val);
          ageDate = new Date(ageDifMs); // miliseconds from epoch
          age = Math.abs(ageDate.getUTCFullYear() - 1970);
          if (age >= 18){
            valid = false;
            errlabel += '<p>La fecha corresponde a un mayor de edad.</p>';
          }
          break;
        case 'accept':
          valid = val;
          if (val !== true) errlabel += '<p>Es necesario aceptar para poder continuar</p>';
          break;
        case 'registration':
          break;
        case 'past':
          ageDifMs = Date.now() - Date.parse(val);
          ageDate = new Date(ageDifMs); // miliseconds from epoch
          time = Math.abs(ageDate.getUTCFullYear() - 1970);
          if (time > 0){
            valid = false;
            errlabel += '<p>La fecha no puede ser futura.</p>';
          }
          break;
        }
    }
    if((att.required != true && att.unique != true) && (val === null || val === '' || val === undefined)){
      valid = null;
      errlabel += '';
    }
    if(store === true) this.status[att.name] = {valid: valid, error_label: errlabel};
    return {valid: valid, error_label: errlabel, attribute_name: att.name};
  }

  async optionAlias(value, key, conf=null){
    if(conf !== null) {
      await this.prepare(conf);
      await this.loadAttributes();
    }
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    return optionAliasSync(value, key);
  }

  optionAliasSync(value, key){
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    try {
      if(Array.isArray(value)) {
        if (Object.keys(this.attributes).includes(key) && Object.keys(this.attributes[key][0]).includes('text')){
          return this.attributes[key].filter((e) => value.includes(e.value)).map((e) => e.text).join(', ');
        }
      } else {
        if (Object.keys(this.attributes).includes(key) && Object.keys(this.attributes[key][0]).includes('text')){
          return this.attributes[key].filter((e) => value.includes(e.value)).map((e) => e.text).join();
        }
      }
    } catch { return '' }
    return value;
  }

  loadDefaults(dims = null) {
    if (this.ready !== true) return { error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY };
    let selected_schema = this.schema.map((e) => e);
    if (dims !== null) {
      selected_schema = this.schema.filter((e) => dims.includes(e.name));
    }
    selected_schema.forEach((e) => {
      if (e.default === null) {
        if (e.type === "number") this.value[e.name] = null;
        else if (e.isArray === true || e.type === "range") this.value[e.name] = [];
        else this.value[e.name] = null;
      } else {
        this.value[e.name] = e.default;
      }
    });
  }
}


class User extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"user", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"user", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }


  async loadData() {
    return super.loadData({obj_id:this.user_id});
  }

  async lastMeasure(vital_id, user_id=null,conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let userid = (user_id !== null) ? user_id : this.user_id;
    let config = {
        baseURL: this.api_url,
        url: `measurement/latest/${userid}/${vital_id}`,
        method: 'GET',
        headers: this.headers,
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

  async passwordRecoveryToken(redir_uri, client_id){
    let config = {
      baseURL: process.env.baseUrl,
      url: "oauth/passwordrecoverylink",
      method: "POST",
      headers: this.headers,
      data: JSON.stringify({
        redirect_uri: redir_uri,
        oauth_client: client_id,
      }),
    };
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            let res_url = new URL(data.url);
            return res_url.searchParams.get('token');
          });
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
        }
      }).catch(() => 'Error!');
  }

  async accessCode(){
    let config = {
      baseURL: process.env.baseUrl,
      url: "oauth/accessToken",
      method: "GET",
      headers: this.headers,
    };
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            return data['Access-Token'];
          });
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: err};
        }
      }).catch(() => 'Error!');

  }

}

class Vital extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"vital", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"vital", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async findByName(name,conf=null ){
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    const { Vitals } = require('./multi');
    let vitals = new Vitals(this.api_url, this.api_key, this.getStore());
    let search_params = {name: name};
    let search_result = await vitals.loadData(search_params, false, 1);
    if(search_result.error === false) {
      this.value = Object.assign({},vitals.value[0]);
    }
    return search_result
  }
}

class Measurement extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"record_vitals", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"record_vitals", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }


  async measureByName(name, user_id=null, total=1, conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let vital = new Vital();
    vital.prepare(this.getStore());
    vital.findByName(name);
    let userid = (user_id !== null) ? user_id : this.user_id;
    vital_id = vital.value._key;
    return this.lastMeasure(vital_id, userid);
  }

  async lastMeasure(vital_id, user_id=null,conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let userid = (user_id !== null) ? user_id : this.user_id;
    let config = {
        baseURL: this.api_url,
        url: `measurement/latest/${userid}/${vital_id}`,
        method: 'GET',
        headers: this.headers,
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

class Referral extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"invitation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"invitation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async addReferral(referral_data, user_id=null,conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let referral_dict = Object.assign(this.value, referral_data);
    let config = {
        baseURL: this.api_url,
        url: 'genReferral',
        method: 'PUT',
        headers: this.headers,
        data: JSON.stringify(referral_dict),
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            console.debug(data)
            Object.assign(this.value, data)
            return {error: false, data: data};
          });
        default:
          return ans.json().then(async (data) => {
            let err_code = data.id;
            switch (err_code){
              case 'user_create_duplicateKey':
                console.debug({error: true, error_dec: 'Duplicate user', err_code: this.error_codes.CREATE_EXISTING_OBJECT, request_err: data})
                return {error: true, error_dec: 'Duplicate user', err_code: this.error_codes.CREATE_EXISTING_OBJECT, request_err: data};
              default:
                console.debug({error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: data})
                return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: data};
            }
          });
      }
    }).catch(() => 'Error!');
  }
}

class CommunicationPreference extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"communication_preference", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"communication_preference", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}


class VitalsPreset extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"vitals_preset", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"vitals_preset", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}
class FeedbackReport extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"feedback", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"feedback", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}
class UserTool extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"user_tool", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"user_tool", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}

class Profile_Status extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"profile_status", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"profile_status", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async initializeFromUser(user){
    // try {
      this.initialize(user.getStore());
    // } catch {
    //   return;
    // }
  }

  async loadUserData(user){
    // try {
      this.initialize(user.getStore());
      await this.prepare();
      await this.loadData({obj_id:this.user_id});
    // } catch {
    //   return;
    // }
  }
}
class Intake extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"intake", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async confirm(id=null, mode=true) {
    if(id == null) id = this.value._key;
    if(id == null) return {error: true, error_dec: 'No id or object given', err_code: this.error_codes.OBJECT_NOT_FOUND};;
    let config = {        
        baseURL: this.api_url,
        url: `confirm_intake/${mode}/${id}`,
        method: 'GET',
        headers: this.headers,
    };
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            return {error: false, data: data};
          });
        default:
          return ans.json().then(async (data) => {
            let err_code = data.id;
            switch (err_code){
              default:
                console.debug({error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: data})
                return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: data};
            }
          });
      }
    }).catch(() => 'Error!');
  }

  unconfirm(id) {
    this.confirm(id, false)
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"intake", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}

class Treatment_Step extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"intake_step", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"intake_step", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}
class Intake_Frequency extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"intake_frequency", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"intake_frequency", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  UTCTimes() {
    this.adjustStartToUTC();
    if(this.value.model === 'fixed_dates' ) {
      var i;
      var j;
      for (i=0; i < this.value.selected_dates.length; i++){
        for (j=0; j < this.value.selected_times.length; j++){
          console.log(this.value.selected_dates[i], this.value.selected_times[j])
          [this.value.selected_dates[i], this.value.selected_times[j]] = this.dateTimeToUTC(this.value.selected_dates[i], this.value.selected_times[j])
          console.log(this.value.selected_dates[i], this.value.selected_times[j])
        }
      }
    }
  }

  dateTimeToUTC(date,time) {
    let datetimeUTC = `${date} ${time}`.toUTCDateFromISO();
    let dateUTC = `${datetimeUTC.getUTCFullYear()}-${String(datetimeUTC.getUTCMonth()+1).padStart(2,'0')}-${String(datetimeUTC.getUTCDate()).padStart(2,'0')}`;
    let timeUTC = `${String(datetimeUTC.getUTCHours()).padStart(2,'0')}:${String(datetimeUTC.getUTCMinutes()).padStart(2,'0')}`;

    return [dateUTC, timeUTC]
  }

  adjustStartToUTC() {
    
    [this.value.start_date, this.value.start_time] = this.dateTimeToUTC(this.value.start_date, this.value.start_time)

  }
  getTimezoneOffset(){
    var date = new Date();
    var offset = date.getTimezoneOffset();
    return offset * 60;
  }
  async create(obj_to_create=null, conf=null, after_load_hook=null) {
    // this.UTCTimes();

    if(!Object.keys(this.value).includes('timezone_offset') || this.value.timezone_offset == undefined || this.value.timezone_offset == null ) this.value.timezone_offset = this.getTimezoneOffset();
    return super.create(obj_to_create, conf, after_load_hook);
  }
}

class Treatment extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"treatment", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"treatment", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}

class Drug extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"drug", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"drug", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}
class Prescription extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"prescription", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"prescription", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}

class Record extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"record", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"record", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}

class Relation extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"relation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"relation", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }
}

class Tutorial extends vitiaObject {

  constructor ({api_url="", api_key="",user_token="", user_id="", search_params={}, file_type=""}={}) {
    super({api_url:api_url, api_key:api_key,obj_type:"tutorial", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type})
  }

  async prepare ({user_token="", user_id="", search_params={}, file_type=""}={}) {
    await super.prepare({obj_type:"tutorial", user_token:user_token, user_id:user_id, search_params:search_params, file_type:file_type});
  }

  async loadByCode(code, conf=null) {
    if(conf !== null) this.prepare(conf);
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    let config = {
      baseURL: this.api_url,
      url: `tutorialByCode/${code}`,
      method: 'GET',
      headers: this.headers,
    }
    let request = make_request_from_object(config);
    return fetch(request).then(async (ans) => {
      switch (ans.status) {
        case 200:
          return ans.json().then(async (data) => {
            Object.assign(this.holder, data); 
            Object.assign(this.value, data);
            if(after_load_hook !== null) after_load_hook(this.value);
            return {error: false};
          });
        default:
          return {error: true, error_dec: 'Request responded with error, check request_err for details', err_code: this.error_codes.REQUEST_ERROR, request_err: ans};
        }
      }).catch(() => "Error!");
  }
}


module.exports = {
  vitiaObject,
  User,
  Vital,
  Measurement,
  Referral,
  CommunicationPreference,
  VitalsPreset,
  FeedbackReport,
  UserTool,
  Profile_Status,
  Intake,
  Treatment_Step,
  Intake_Frequency,
  Treatment,
  Drug,
  Prescription,
  Record,
  Relation,
  Tutorial
}