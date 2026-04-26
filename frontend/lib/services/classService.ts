import { IClassRepo, IEnrolmentRepo } from "../api/adapters/interfaces";
import { AttendanceStatus } from "../api/types";
import {
  CreateClassDataParams,
  UpdateClassDataParams,
} from "../api/types/class";

function ClassService(classRepo: IClassRepo, enrolmentRepo: IEnrolmentRepo) {
  async function createClassAsync(data: CreateClassDataParams) {
    return await classRepo.createClassAsync(data);
  }

  async function updateClassAsync(id: string, data: UpdateClassDataParams) {
    return await classRepo.updateClassAsync(id, data);
  }

  async function getClassTimesAsync() {
    return await classRepo.getClassTimesAsync();
  }

  async function getClassByIdAsync(classId: string) {
    return await classRepo.getClassByIdAsync(classId);
  }

  async function getEnrolmentsByClassIdAsync(classId: string) {
    return await enrolmentRepo.getEnrolmentsByClassIdAsync(classId);
  }

  async function getAttendanceByStudentAndClassAndTermAsync(studentId: string, classId: string, termId: string) { 
    return await classRepo.getAttendanceByStudentAndClassAndTermAsync(studentId, classId, termId);
  }

async function updateStudentAttendanceInClassAndTermPerWeekAsync(
  studentId: string,
  classId: string,
  termId: string,
  week: number,
  status: AttendanceStatus,
) {
  return await classRepo.updateStudentAttendanceInClassAndTermPerWeekAsync(studentId, classId, termId, week, status );
} 

  return {
    createClassAsync,
    updateClassAsync,
    getClassTimesAsync,
    getClassByIdAsync,
    getEnrolmentsByClassIdAsync,
    getAttendanceByStudentAndClassAndTermAsync,
    updateStudentAttendanceInClassAndTermPerWeekAsync,
  };
}

export default ClassService;