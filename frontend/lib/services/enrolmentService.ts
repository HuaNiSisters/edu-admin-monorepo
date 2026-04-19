import { Enrolment, EnrolmentStatus } from "@/lib/api/types";
import { IEnrolmentRepo } from "../api/adapters/interfaces";

function EnrolmentService(enrolmentRepo: IEnrolmentRepo) {
  async function enrolAsync(data: {
    studentId: string;
    classId: string;
    termId: string;
  }) {
    const enrolmentDate = new Date().toISOString();
    const defaultStatus = "active" as EnrolmentStatus;

    return await enrolmentRepo.createEnrolmentAsync({
      student_id: data.studentId,
      class_id: data.classId,
      term_id: data.termId,
      enrolment_date: enrolmentDate,
      status: defaultStatus,
    });
  }

  async function getEnrolmentsByStudentIdAsync(studentId: string) {
    return await enrolmentRepo.getEnrolmentsByStudentIdAsync(studentId);
  }

  async function getEnrolmentsByClassIdAsync(classId: string) {
    return await enrolmentRepo.getEnrolmentsByClassIdAsync(classId);
  }

  return {
    enrolAsync,
    getEnrolmentsByStudentIdAsync,
    getEnrolmentsByClassIdAsync,
  };
}

export default EnrolmentService;
