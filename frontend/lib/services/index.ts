import StudentService from "./person/studentService";
import EmployeeService from "./person/employeeService";
import SubjectService from "./subjectService";
import CampusService from "./campusService";
import PersonService from "./person";
import ClassService from "./classService";
import SupabaseApiWrapper from "../api/adapters/supabaseAdapter";

const supabaseApiWrapper = new SupabaseApiWrapper();

const campusService = CampusService(supabaseApiWrapper);
const personService = PersonService(supabaseApiWrapper);
const studentService = StudentService(supabaseApiWrapper);
const employeeService = EmployeeService(supabaseApiWrapper);
const subjectService = SubjectService(supabaseApiWrapper);
const classService = ClassService(supabaseApiWrapper);

export {
  campusService,
  personService,
  studentService,
  employeeService,
  subjectService,
  classService,
};
