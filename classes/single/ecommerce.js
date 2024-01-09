import { vitiaObject } from '@vitiacare/vitiacare_sdk_js/classes/single/single';

export class Ecommerce extends vitiaObject {

  constructor(api_url = null, api_key = null, rel_id = null, access_token = null) {
    super(api_url, api_key);
    this.set_type('ecommerce');
    if (access_token !== null) this.set_access_token(access_token);
  }

  async checkout(checkout_id, paymentMethods){
    await this.send_request('POST', `ecommerce/checkout/${checkout_id}`, {paymentMethods});
    switch(this.response.status) {
      case 200:
        this.response.error = false;
        return await this.response.json().then((j) => j);
        break;
      default:
        this.response.error = true;    
        break;
      }  
  }




}
