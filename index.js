
String.prototype.toUTCDateFromISO = function() {
  let parts = []
  if(this.length >= 4) {
      parts.push(this.substring(0,4))
  }
  if(this.length >= 7) {
      parts.push(this.substring(5,7) - 1) 
  }
  if(this.length >= 10) {
      parts.push(this.substring(8,10))
  }
  if(this.length >= 13) {
      parts.push(this.substring(11,13))
  }
  if(this.length >= 16) {
      parts.push(this.substring(14,16))
  }
  if(this.length >= 19) {
      parts.push(this.substring(17,19))
  }
  if(this.length >= 26) {
      parts.push(this.substring(20,26))
  }
  return new Date(...parts)
}

String.prototype.toTitle = function() {
  return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
}

const {
  vitiaObject,
  Vital,
  Measurement,
  CommunicationPreference,
  VitalsPreset,
  FeedbackReport,
  UserTool,
  Profile_Status,
  Treatment_Step,
  Intake_Frequency,
  Treatment,
  Drug,
  Record,
  
  Tutorial
  } =  require('@vitiacare/vitiacare_sdk_js/classes/single/single');

const { User } = require('@vitiacare/vitiacare_sdk_js/classes/single/user')

const { Intake } = require('@vitiacare/vitiacare_sdk_js/classes/single/intake')

const { Prescription } = require('@vitiacare/vitiacare_sdk_js/classes/single/prescription')

const { Relation } = require('@vitiacare/vitiacare_sdk_js/classes/single/relation')

const { Message } = require('@vitiacare/vitiacare_sdk_js/classes/single/message')

const { Referral } = require('@vitiacare/vitiacare_sdk_js/classes/single/referral')

const {
    Vitals,
    Measurements,
    vitiaMultiObject,
    CommunicationPreferences,
    VitalsPresets,
    FeedbackReports,
    UserTools,
    Profiles_Status,
    Treatment_Steps,
    Intake_Frequencies,
    Treatments,
    Drugs,
    Prescriptions,
    Records,
    Tutorials
  } =  require('@vitiacare/vitiacare_sdk_js/classes/multi/multi');
  
const { Intakes } = require('@vitiacare/vitiacare_sdk_js/classes/multi/intake')

const { Relations } = require('@vitiacare/vitiacare_sdk_js/classes/multi/relation')

const { Messages } = require('@vitiacare/vitiacare_sdk_js/classes/multi/message')

const { Users } = require('@vitiacare/vitiacare_sdk_js/classes/multi/user')

const { Referrals } = require('@vitiacare/vitiacare_sdk_js/classes/multi/referral')

module.exports = {
    Message,
    Messages,
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
    Tutorials,
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