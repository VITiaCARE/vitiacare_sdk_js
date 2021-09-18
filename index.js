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
  Relation
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
    Relation
  }