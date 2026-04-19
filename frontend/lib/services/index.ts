import StudentService from "./person/studentService";
import EmployeeService from "./person/employeeService";
import SubjectService from "./subjectService";
import CampusService from "./campusService";
import PersonService from "./person";
import ClassService from "./classService";
import TermService from "./termService";
import EnrolmentService from "./enrolmentService";
import { SMSService } from "./smsService";

import SupabaseApiWrapper from "../api/adapters/supabaseAdapter";
import { ourBackendAdapter } from "../api/adapters/ourBackendAdapter";

const supabaseApiWrapper = new SupabaseApiWrapper();
const ourBackendApiWrapper = ourBackendAdapter();

const campusService = CampusService(supabaseApiWrapper);
const personService = PersonService(supabaseApiWrapper);
const studentService = StudentService(supabaseApiWrapper, supabaseApiWrapper);
const employeeService = EmployeeService(supabaseApiWrapper);
const subjectService = SubjectService(supabaseApiWrapper);
const classService = ClassService(supabaseApiWrapper);
const enrolmentService = EnrolmentService(supabaseApiWrapper);
const termService = TermService(supabaseApiWrapper);

const smsService = SMSService(ourBackendApiWrapper);

export {
  campusService,
  personService,
  studentService,
  employeeService,
  subjectService,
  classService,
  termService,
  enrolmentService,
  smsService,
};
