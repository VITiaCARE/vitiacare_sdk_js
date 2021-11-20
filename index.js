
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

const {
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
  } =  require('./classes/single');

  const {
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
  } =  require('./classes/multi');
  
  module.exports = {
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