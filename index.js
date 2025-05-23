
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

import {
  vitiaObject,
  
  
  CommunicationPreference,
  VitalsPreset,
  FeedbackReport,
  UserTool,
  Profile_Status,
  Treatment_Step,
  Tutorial
  } from '@vitiacare/vitiacare_sdk_js/classes/single';

  import { IntakeFrequency } from '@vitiacare/vitiacare_sdk_js/classes/single/intakeFrequency';

  import { User } from '@vitiacare/vitiacare_sdk_js/classes/single/user'

  import { Patient } from '@vitiacare/vitiacare_sdk_js/classes/single/patient'

import { Intake } from '@vitiacare/vitiacare_sdk_js/classes/single/intake'

import { Prescription } from '@vitiacare/vitiacare_sdk_js/classes/single/prescription'

import { Treatment } from '@vitiacare/vitiacare_sdk_js/classes/single/treatment'

import { Relation } from '@vitiacare/vitiacare_sdk_js/classes/single/relation'

import { Message } from '@vitiacare/vitiacare_sdk_js/classes/single/message'

import { Referral } from '@vitiacare/vitiacare_sdk_js/classes/single/referral'

import { Record } from '@vitiacare/vitiacare_sdk_js/classes/single/record'

import { Vital } from '@vitiacare/vitiacare_sdk_js/classes/single/vital'

import { Measurement } from '@vitiacare/vitiacare_sdk_js/classes/single/measurement'

import { Drug } from '@vitiacare/vitiacare_sdk_js/classes/single/drug'

import { FileObj } from '@vitiacare/vitiacare_sdk_js/classes/single/file'

import { Disease } from '@vitiacare/vitiacare_sdk_js/classes/single/disease'

import { Diagnosis } from '@vitiacare/vitiacare_sdk_js/classes/single/diagnosis'

import { Ecommerce } from '@vitiacare/vitiacare_sdk_js/classes/single/ecommerce'

import { Purchase } from '@vitiacare/vitiacare_sdk_js/classes/single/purchase'

import { Address } from '@vitiacare/vitiacare_sdk_js/classes/single/address'

import { ProfileStatus }  from '@vitiacare/vitiacare_sdk_js/classes/single/profileStatus'

import { Appointment }  from '@vitiacare/vitiacare_sdk_js/classes/single/appointment'

import { ActionFlow }  from '@vitiacare/vitiacare_sdk_js/classes/single/actionFlow'

import { Question }  from '@vitiacare/vitiacare_sdk_js/classes/single/question'

import { QuestionAnswer }  from '@vitiacare/vitiacare_sdk_js/classes/single/questionAnswer'

import { MealRecord }  from '@vitiacare/vitiacare_sdk_js/classes/single/mealRecord'

import { WorkoutSession }  from '@vitiacare/vitiacare_sdk_js/classes/single/workoutSession'

import { List }  from '@vitiacare/vitiacare_sdk_js/classes/single/list'

import { UserList }  from '@vitiacare/vitiacare_sdk_js/classes/single/userList'

import { UserListAnswer }  from '@vitiacare/vitiacare_sdk_js/classes/single/userListAnswer'

import { Reward }  from '@vitiacare/vitiacare_sdk_js/classes/single/reward'

import {
    vitiaMultiObject,
    CommunicationPreferences,
    VitalsPresets,
    FeedbackReports,
    UserTools,
    Profiles_Status,
    Treatment_Steps,
    
    Tutorials
  } from '@vitiacare/vitiacare_sdk_js/classes/multi';
  
import { Drugs } from '@vitiacare/vitiacare_sdk_js/classes/multi/drug'

import { Diseases } from '@vitiacare/vitiacare_sdk_js/classes/multi/disease'

import { Intakes } from '@vitiacare/vitiacare_sdk_js/classes/multi/intake'

import { Relations } from '@vitiacare/vitiacare_sdk_js/classes/multi/relation'

import { Prescriptions } from '@vitiacare/vitiacare_sdk_js/classes/multi/prescription'

import { Messages } from '@vitiacare/vitiacare_sdk_js/classes/multi/message'

import { Users } from '@vitiacare/vitiacare_sdk_js/classes/multi/user'

import { Referrals } from '@vitiacare/vitiacare_sdk_js/classes/multi/referral'

import { Records } from '@vitiacare/vitiacare_sdk_js/classes/multi/record'

import { Treatments } from '@vitiacare/vitiacare_sdk_js/classes/multi/treatment'

import { Measurements } from '@vitiacare/vitiacare_sdk_js/classes/multi/measurement'

import { Vitals } from '@vitiacare/vitiacare_sdk_js/classes/multi/vital'

import { IntakeFrequencies } from '@vitiacare/vitiacare_sdk_js/classes/multi/intakeFrequency'

import { Diagnostics } from '@vitiacare/vitiacare_sdk_js/classes/multi/diagnosis'

import { Addresses } from '@vitiacare/vitiacare_sdk_js/classes/multi/address'

import { Purchases } from '@vitiacare/vitiacare_sdk_js/classes/multi/purchase'

import { Appointments } from '@vitiacare/vitiacare_sdk_js/classes/multi/appointment'

import { ActionFlows }  from '@vitiacare/vitiacare_sdk_js/classes/multi/actionFlow'

import { MealRecords }  from '@vitiacare/vitiacare_sdk_js/classes/multi/mealRecord'

import { WorkoutSessions }  from '@vitiacare/vitiacare_sdk_js/classes/multi/workoutSession'

import { Catalogues }  from '@vitiacare/vitiacare_sdk_js/classes/support/catalogues'

import { Notifications }  from '@vitiacare/vitiacare_sdk_js/classes/multi/notification'

import { Rewards }  from '@vitiacare/vitiacare_sdk_js/classes/multi/reward'

export {
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
    List,
    Reward,
  Rewards,
    Catalogues
    }