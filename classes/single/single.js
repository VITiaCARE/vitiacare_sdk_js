const { make_request_from_object } = require('../../helpers/request').default;
const { getLocation } = require('../../functions/user_properties')
const { Interface } = require('../../helpers/interface')

class vitiaObject extends Interface{  

  constructor(api_url, api_key){
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
    super(api_url,  `Bearer ${api_key}`)
    this.api_key = api_key;
    this.api_url = api_url;
    this.initialize()
    this.ready = true
  }

  initialize () {
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
    this.response = {};
    this.status = {}
    this.attributes = {};
    this.staged_changes = {};
    this.stagging = false;
    this.muelti = false;
  }

  set_type(obj_type) {
    this.obj_type = obj_type;
  }

  set_user_token(user_token) {
    this.user_token = user_token;
    this.update_headers({'UserToken':user_token})
  }

  get_user_token() {
    if(this.user_token == null || this.user_token == undefined) return '';
    return this.user_token;
  }

  set_location(lat, long){
    let loc = [lat,long];
    this.update_headers({'User-Location':loc})
  }

  set_user_id(user_id) {
    this.user_id = user_id;
    this.update_headers({ 'User-Id': user_id })
  }

  setForceSync(force) {
    this.update_headers({'Force-Sync':force})
  }

  set_relation_id(rel_id) {
    if (rel_id && rel_id != null && rel_id != undefined){ 
      this.rel_id = rel_id;
      this.update_headers({ 'Relation-Id': rel_id })
    }
  }


  set_id(obj_id) {
    this.obj_id = obj_id;
    this.value._key = obj_id;
  }

  get_access_token() {
    if(this.access_token == null || this.access_token == undefined) return '';
    return this.access_token;
  }
  set_access_token(access_token){
    this.access_token = {'Access-Token':access_token};
    this.update_headers({'Access-Token':access_token});
  }
  
  get_id(){
    if (this.obj_id !== null && this.obj_id !== undefined && this.obj_id != '') return this.obj_id;
    if (Object.keys(this.value).includes('_key') && this.value._key != '' && this.value._key != null){
      this.obj_id = this.value._key;
      return this.value._key;
    }
    return null;
  }

  get_data(){
    return this.value;
  }
  
  set_search_params(search_params) {
    this.search_params = search_params;
  }

  getSchema(){
    return this.schema;
  }

  get_user_id() {
    return this.user_id;
  }

  getAttributeOptions(attribute){
    try {
      return this.attributes[attribute]
    } catch {
      return []
    }
  }

  async loadSchema(after_load_hook=null){
    await this.send_request('GET', `scheme/${this.obj_type}`);
    switch(this.response.status) {
      case 200:
        await this.response.json().then((j) => this.schema = j.schema);
        if(after_load_hook !== null) after_load_hook(this.schema);
        this.response.error = false;
        break;
      default:
        this.response.error = true;
        break;
    }
  }

  async loadAttributeOptions(attribute, after_load_hook=null){
    if(!this.schema || this.schema.length < 1) await this.loadSchema();
    var e;
    try {
      e = this.schema.filter((e) => e.name===attribute)[0]
    } catch {
      return
    }
    if (e.options.type==='fixed') {
      this.attributes[attribute] = e.options.detail;
    } else {
      await this.send_request('GET', `attributeOptions/${e.options.type}`);
      switch(this.response.status) {
        case 200:
          await this.response.json().then((j) => this.attributes[attribute] = j);
          if(after_load_hook !== null) after_load_hook(this.attributes[attribute]);
          this.response.error = false;
          break;
        default:
          this.response.error = true;
          break;
        }
  
    }
  }
  
  async loadAttributes(){
    if(!this.schema || this.schema.length < 1) await this.loadSchema();
    let promises = []
    this.schema.filter((e) => e.type==='options').forEach((s) => {
      promises.push(this.loadAttributeOptions(s.name));
    })
    await Promise.all(promises);
  }


async loadData(obj_id, after_load_hook=null) {
  await this.send_request('GET', `${this.obj_type}/${obj_id}`);
  switch(this.response.status) {
    case 200:
      await this.response.json().then(async (data) => {
        await Object.assign(this.holder, data); 
        await Object.assign(this.value, data);
        this.set_id(this.value._key);
        if(after_load_hook !== null){ after_load_hook(this.value);}
        this.response.error = false;
      });
      break;
    default:
      this.response.error = true;    
      break;
    }
  }

  async create(object_to_create, after_load_hook=null ){
    return await this.post(object_to_create, after_load_hook=null)
  }

  async post(object_to_create, after_load_hook=null ){
    await this.send_request('POST', `${this.obj_type}`, object_to_create);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then((j) => this.set_id(j.id));
        if(after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        break;
      }  
  }

  async update(id, update_object, after_load_hook=null ){
    await this.send_request('PATCH', `${this.obj_type}/${id}`, update_object);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        await this.response.json().then((j) => Object.assign(this.value, j));
        if(after_load_hook != null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        break;
      }  
  }

  async store(after_load_hook=null){
    if(this.get_id() !== '' && this.get_id() !== null) await this.update(this.get_id(), this.value, after_load_hook);
    else await this.create(this.value, after_load_hook);
  }

  async delete(after_load_hook=null){
    await this.send_request('DELETE', `${this.obj_type}/${this.get_id()}`);
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        this.value = {}
        this.holder = {}
        this.set_id('')
        if(after_load_hook !== null) after_load_hook(this.value);
        break;
      default:
        this.response.error = true;    
        break;
      }  
  }

  async reset(attributes=null){
    let reset_list = this.schema.map((e) => e);
    let base_obj = Object.assign(this.holder);
    if(attributes !== null){
      if(Array.isArray(attributes)){
        reset_list = this.schema.filter((e) => attributes.includes(e.name));
      } else if (typeof attributes === 'object') {
        reset_list = this.schema.filter((e) => Object.keys(attributes).includes(e.name));
        base_obj = Object.assign(attributes);
      } else {
        return;
      } 
    }
    await reset_list.forEach((att) => {
      this.value[att.name] = base_obj[att.name];
    });
  }

  loadDefaults(dims = null) {
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

  // TODO

  async checkStatus(attributes=null) {
    if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
    if(this.schema == []) await this.loadSchema();
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

  // async optionAlias(value, key, conf=null){
  //   if(conf !== null) {
  //     await this.prepare(conf);
  //     await this.loadAttributes();
  //   }
  //   if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
  //   return optionAliasSync(value, key);
  // }

  // optionAliasSync(value, key){
  //   if(this.ready !== true) return {error: true, error_dec: 'Service not ready. Did you prepare() it first?', err_code: this.error_codes.NOT_READY};
  //   try {
  //     if(Array.isArray(value)) {
  //       if (Object.keys(this.attributes).includes(key) && Object.keys(this.attributes[key][0]).includes('text')){
  //         return this.attributes[key].filter((e) => value.includes(e.value)).map((e) => e.text).join(', ');
  //       }
  //     } else {
  //       if (Object.keys(this.attributes).includes(key) && Object.keys(this.attributes[key][0]).includes('text')){
  //         return this.attributes[key].filter((e) => value.includes(e.value)).map((e) => e.text).join();
  //       }
  //     }
  //   } catch { return '' }
  //   return value;
  // }
}


class Translation extends vitiaObject {

  constructor (api_url=null, api_key=null) {
    super(api_url, api_key);
    this.set_type('labels');
  }

  async loadData(id=null) {
    if(id != null) this.set_id(id)
    await super.loadData(this.get_id());
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
  CommunicationPreference,
  VitalsPreset,
  FeedbackReport,
  UserTool,
  Profile_Status,
  Treatment_Step,
  Intake_Frequency,
  Tutorial,
  Translation
}