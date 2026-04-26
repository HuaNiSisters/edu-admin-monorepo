import { AttendanceStatus, ClassTime, ClassTimeWithSubjectAndTutor, EnrolmentWithClassAndTerm } from "@/lib/api/types";
import {
  CreateClassDataParams,
  UpdateClassDataParams,
  GetClassTimesResponse,
} from "@/lib/api/types/class";

interface IClassRepo {
  createClassAsync: (data: CreateClassDataParams) => Promise<ClassTime>;
  updateClassAsync: (
    id: string,
    data: UpdateClassDataParams,
  ) => Promise<ClassTime>;
  getClassTimesAsync: () => Promise<GetClassTimesResponse>;
  getClassByIdAsync: (classId: string) => Promise<ClassTimeWithSubjectAndTutor  >;
  getEnrolmentsByClassIdAsync: (
    classId: string,
  ) => Promise<EnrolmentWithClassAndTerm[]>;  
  getAttendanceByStudentAndClassAndTermAsync: (studentId: string, classId: string, termId: string) => Promise<any>; // Replace 'any' with the actual return type
  updateStudentAttendanceInClassAndTermPerWeekAsync: (studentId: string, classId: string, termId: string, week: number, status: AttendanceStatus) => Promise<void>; // Replace 'any' with the actual type for status
// ENROL
}

export type {
    IClassRepo,
}