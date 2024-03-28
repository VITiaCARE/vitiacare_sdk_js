
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
  
  
  CommunicationPreference,
  VitalsPreset,
  FeedbackReport,
  UserTool,
  Profile_Status,
  Treatment_Step,
  Tutorial
  } =  require('@vitiacare/vitiacare_sdk_js/classes/single/single');

  import { IntakeFrequency } from '@vitiacare/vitiacare_sdk_js/classes/single/intakeFrequency';

const { User } = require('@vitiacare/vitiacare_sdk_js/classes/single/user')

const { Patient } = require('@vitiacare/vitiacare_sdk_js/classes/single/patient')

const { Intake } = require('@vitiacare/vitiacare_sdk_js/classes/single/intake')

const { Prescription } = require('@vitiacare/vitiacare_sdk_js/classes/single/prescription')

const { Treatment } = require('@vitiacare/vitiacare_sdk_js/classes/single/treatment')

const { Relation } = require('@vitiacare/vitiacare_sdk_js/classes/single/relation')

const { Message } = require('@vitiacare/vitiacare_sdk_js/classes/single/message')

const { Referral } = require('@vitiacare/vitiacare_sdk_js/classes/single/referral')

const { Record } = require('@vitiacare/vitiacare_sdk_js/classes/single/record')

const { Vital } = require('@vitiacare/vitiacare_sdk_js/classes/single/vital')

const { Measurement } = require('@vitiacare/vitiacare_sdk_js/classes/single/measurement')

const { Drug } = require('@vitiacare/vitiacare_sdk_js/classes/single/drug')

const { FileObj } = require('@vitiacare/vitiacare_sdk_js/classes/single/file')

const { Disease } = require('@vitiacare/vitiacare_sdk_js/classes/single/disease')

const { Diagnosis } = require('@vitiacare/vitiacare_sdk_js/classes/single/diagnosis')

const { Ecommerce } = require('@vitiacare/vitiacare_sdk_js/classes/single/ecommerce')

const { Purchase } = require('@vitiacare/vitiacare_sdk_js/classes/single/purchase')

const { Address } = require('@vitiacare/vitiacare_sdk_js/classes/single/address')

const { ProfileStatus }  = require('@vitiacare/vitiacare_sdk_js/classes/single/profileStatus')

const { Appointment }  = require('@vitiacare/vitiacare_sdk_js/classes/single/appointment')

const { ActionFlow }  = require('@vitiacare/vitiacare_sdk_js/classes/single/actionFlow')

const { Question }  = require('@vitiacare/vitiacare_sdk_js/classes/single/question')

const { QuestionAnswer }  = require('@vitiacare/vitiacare_sdk_js/classes/single/questionAnswer')

const { MealRecord }  = require('@vitiacare/vitiacare_sdk_js/classes/single/mealRecord')

const { WorkoutSession }  = require('@vitiacare/vitiacare_sdk_js/classes/single/workoutSession')

const { List }  = require('@vitiacare/vitiacare_sdk_js/classes/single/list')

const { UserList }  = require('@vitiacare/vitiacare_sdk_js/classes/single/userList')

const { UserListAnswer }  = require('@vitiacare/vitiacare_sdk_js/classes/single/userListAnswer')

const {
    vitiaMultiObject,
    CommunicationPreferences,
    VitalsPresets,
    FeedbackReports,
    UserTools,
    Profiles_Status,
    Treatment_Steps,
    
    Tutorials
  } =  require('@vitiacare/vitiacare_sdk_js/classes/multi/multi');
  
const { Drugs } = require('@vitiacare/vitiacare_sdk_js/classes/multi/drug')

const { Diseases } = require('@vitiacare/vitiacare_sdk_js/classes/multi/disease')

const { Intakes } = require('@vitiacare/vitiacare_sdk_js/classes/multi/intake')

const { Relations } = require('@vitiacare/vitiacare_sdk_js/classes/multi/relation')

const { Prescriptions } = require('@vitiacare/vitiacare_sdk_js/classes/multi/prescription')

const { Messages } = require('@vitiacare/vitiacare_sdk_js/classes/multi/message')

const { Users } = require('@vitiacare/vitiacare_sdk_js/classes/multi/user')

const { Referrals } = require('@vitiacare/vitiacare_sdk_js/classes/multi/referral')

const { Records } = require('@vitiacare/vitiacare_sdk_js/classes/multi/record')

const { Treatments } = require('@vitiacare/vitiacare_sdk_js/classes/multi/treatment')

const { Measurements } = require('@vitiacare/vitiacare_sdk_js/classes/multi/measurement')

const { Vitals } = require('@vitiacare/vitiacare_sdk_js/classes/multi/vital')

const { IntakeFrequencies } = require('@vitiacare/vitiacare_sdk_js/classes/multi/intakeFrequency')

const { Diagnostics } = require('@vitiacare/vitiacare_sdk_js/classes/multi/diagnosis')

const { Addresses } = require('@vitiacare/vitiacare_sdk_js/classes/multi/address')

const { Purchases } = require('@vitiacare/vitiacare_sdk_js/classes/multi/purchase')

const { Appointments } = require('@vitiacare/vitiacare_sdk_js/classes/multi/appointment')

const { ActionFlows }  = require('@vitiacare/vitiacare_sdk_js/classes/multi/actionFlow')

const { MealRecords }  = require('@vitiacare/vitiacare_sdk_js/classes/multi/mealRecord')

const { WorkoutSessions }  = require('@vitiacare/vitiacare_sdk_js/classes/multi/workoutSession')

const { Catalogues }  = require('@vitiacare/vitiacare_sdk_js/classes/support/catalogues')

const { Notifications }  = require('@vitiacare/vitiacare_sdk_js/classes/multi/notification')

module.exports = {
  Catalogues,
    Diagnostics,
    Message,
    Messages,
    Vitals,
    Relations,
    Diseases,
    Disease,
    Diagnosis,
    Measurements,
    vitiaMultiObject,
    Users,
    Referrals,
    CommunicationPreferences,
    VitalsPresets,
    FeedbackReports,
    UserTools,
    Intakes,
    Treatments,
    Treatment_Steps,
    IntakeFrequencies,
    Drugs,
    Prescriptions,
    Records,
    Tutorials,
    vitiaObject,
    FileObj,
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
    IntakeFrequency,
    Treatment,
    Drug,
    Prescription,
    Record,
    Relation,
    Tutorial,
    Patient,
    Ecommerce,
    Purchase,
    Address,
    Addresses,
    Purchases,
    ProfileStatus,
    Appointment,
    Appointments,
    ActionFlow,
    ActionFlows,
    Question,
    QuestionAnswer,
    MealRecord,
    MealRecords,
    WorkoutSession,
    WorkoutSessions,
    Notifications,
    UserList,
    UserListAnswer,
    List
  }