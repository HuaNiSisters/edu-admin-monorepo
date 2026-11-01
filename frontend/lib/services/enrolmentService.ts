import { EnrolmentStatus } from "@/lib/api/types";
import { IEnrolmentRepo } from "../api/adapters/interfaces";

function EnrolmentService(enrolmentRepo: IEnrolmentRepo) {
  async function enrolAsync(data: {
    studentId: string;
    classId: string;
    termId: string;
    classStartDate?: string;
  }) {
    const enrolmentDate = data.classStartDate
      ? new Date(`${data.classStartDate}T12:00:00`).toISOString()
      : new Date().toISOString();
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

  async function updateEnrolmentDateAsync(
    enrolmentId: string,
    classStartDate: string,
  ) {
    const enrolmentDate = new Date(`${classStartDate}T12:00:00`).toISOString();
    return await enrolmentRepo.updateEnrolmentDateAsync(
      enrolmentId,
      enrolmentDate,
    );
  }

  async function getEnrolmentsByClassIdAsync(classId: string) {
    return await enrolmentRepo.getEnrolmentsByClassIdAsync(classId);
  }

  async function deleteEnrolmentAsync(enrolmentId: string) {
    return await enrolmentRepo.deleteEnrolmentAsync(enrolmentId);
  }

  return {
    enrolAsync,
    getEnrolmentsByStudentIdAsync,
    updateEnrolmentDateAsync,
    getEnrolmentsByClassIdAsync,
    deleteEnrolmentAsync,
  };
}

export default EnrolmentService;
