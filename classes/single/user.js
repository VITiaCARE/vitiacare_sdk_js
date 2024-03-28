import {vitiaObject } from './single';

export class User extends vitiaObject {

    constructor (api_url=null, api_key=null, user_id=null, user_token=null) {
      super(api_url, api_key);
      this.set_type('user');
      if(user_id!==null) {
        this.set_user_id(user_id);
      }
      if(user_token!==null) this.set_user_token(user_token);
    }
  
    set_id(id) {
      this.obj_id = id;
      this.value._key = id;
  
    }
  
    set_user_id(user_id){
      this.user_id = user_id;
      this.update_headers({'UserId':user_id})
    }
    
    async loadData() {
      await super.loadData(this.user_id);
    }
  
    async get_user_info() {
      await this.send_request('GET', `oauth/userinfo`);    
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            Object.assign(this.holder, data); 
            Object.assign(this.value, data);
            this.set_user_id(this.value._key)
          });
        default:
          this.response.error = true
          return {}
        }
    }
  
    async get_profile_pic_url() {
      await this.send_request('GET', `user/${this.user_id}/file/profile_pic/uri`);    
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
  
    async lastMeasure(vital_id, user_id=null) {
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `measurement/latest/${userid}/${vital_id}`);    
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data.last_measure;
          });
        default:
          this.response.error = true
          return {}
        }
    }
  
    async lastMeasures(vital_list, user_id=null) {
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `measurement/latest/${userid}`,{},{vital_ids:vital_list.join(",")});
        switch (this.response.status) {
          case 200:
            return this.response.json().then(async (data) => {
              this.response.error = false
              return data.last_measure;
            });
          default:
            this.response.error = true
            return []
          }
    }
  
    async loyaltyProfile(user_id=null) {
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `loyalty/summary_profile/${userid}`);
        switch (this.response.status) {
          case 200:
            return this.response.json().then(async (data) => {
              this.response.error = false
              this.value.loyaltyProfile = data;
              return data;
            });
          default:
            this.response.error = true
            return null
          }
    }
  
    async loyaltyBalance(user_id=null) {
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `/user/${userid}/rewards/balance`);
        switch (this.response.status) {
          case 200:
            return this.response.json().then(async (data) => {
              this.response.error = false
              this.value.loyaltyBalance = data.balance;
              return data;
            });
          default:
            this.response.error = true
            return null
          }
    }
  
    async passwordRecoveryToken(user_id=null){
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `oauth/passwordUpdateCode/${userid}`);
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data.code;
          });
        default:
          this.response.error = true
          return null
        }
    }
  
    async passwordUpdateLink(user_id=null){
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `oauth/passwordUpdateLink/${userid}`);
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data.link;
          });
        default:
          this.response.error = true
          return null
        }
    }
  
    async accessCode(user_id=null){
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `oauth/accessToken/${userid}`);
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data;
          });
        default:
          this.response.error = true
        }
  
    }
  
    async testToken(user_id=null){
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('GET', `check/usertoken/${userid}`);
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data.ans;
          });
        default:
          this.response.error = true
          return false
        }
  
    }
  
    async refreshToken(refreshToken){
      await this.send_request('POST', '/oauth/authorize', {refresh_token:refreshToken, grant_type:'refresh_token'});
      switch (this.response.status) {
        case 200:
          this.response.error = false
          return this.response.json().then(async (data) => {
            return data;
          });
        default:
          this.response.error = true
          return null;
        }
  
    }
  
    async logout(user_id=null){
      let userid = (user_id !== null) ? user_id : this.user_id;
      await this.send_request('POST', `oauth/logout/${userid}`, {});
      switch (this.response.status) {
        case 200:
          this.response.error = false
          this.set_id('')
          this.value = {}
          this.holder = {}
          this.response.error = false
          break;
        default:
          this.response.error = true
        }
  
    }
  
    async getTasks(user_id=null, tasksType = 'tasks', limit=3){
      let userid = (user_id !== null) ? user_id : this.user_id;

      await this.send_request('GET', `routines/${tasksType}/${userid}`, {}, {total:limit});
      switch (this.response.status) {
        case 200:
          return this.response.json().then(async (data) => {
            return data;
          })
        default:
          this.response.error = true
          return [];
        }
  
    }
  
    async getAwards(user_id=null, awardsIds = null){
      let userid = (user_id !== null) ? user_id : this.user_id;
      if(awardsIds == null || awardsIds == undefined || !awardsIds || awardsIds.length <= 0){ 
        return [];
      }
      await this.send_request('GET', `loyalty/awards/${userid}`, {}, {awardsIds:awardsIds.join(',')});
      switch (this.response.status) {
        case 200:
          return this.response.json().then(async (data) => {
            return data;
          })
        default:
          this.response.error = true
          return [];
        }
  
    }
  }
  
