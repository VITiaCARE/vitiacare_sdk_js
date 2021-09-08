const {
    vitiaObject,
    User,
    Vital,
    Measurement,
    Referral
  } =  require('./classes/single');
  
  const {
    Vitals,
    Relations,
    Measurements,
    vitiaMultiObject
  } =  require('./classes/multi');
  
  module.exports = {
    Vitals,
    Relations,
    Measurements,
    vitiaMultiObject,
    vitiaObject,
    User,
    Vital,
    Measurement,
    Referral
  }