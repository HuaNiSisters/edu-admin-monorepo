import { Enrolment, EnrolmentWithClassAndTerm } from "@/lib/api/types";
import { CreateEnrolmentDataParams } from "../../types/enrolment";

interface IEnrolmentRepo {
  createEnrolmentAsync: (data: CreateEnrolmentDataParams) => Promise<Enrolment>;
  // updateEnrolmentAsync: (
  //   id: string,
  //   data: UpdateEnrolmentDataParams,
  // ) => Promise<Enrolment>;
  getEnrolmentsByStudentIdAsync: (
    studentId: string,
  ) => Promise<EnrolmentWithClassAndTerm[]>;
  getEnrolmentsByClassIdAsync: (
    classId: string,
  ) => Promise<EnrolmentWithClassAndTerm[]>;
  deleteEnrolmentAsync: (enrolmentId: string) => Promise<void>;
}

export type { IEnrolmentRepo };
