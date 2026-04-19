import { Enrolment } from "@/lib/api/types";
import {
  CreateEnrolmentDataParams,
  UpdateEnrolmentDataParams,
} from "../../types/enrolment";

interface IEnrolmentRepo {
  createEnrolmentAsync: (data: CreateEnrolmentDataParams) => Promise<Enrolment>;
  updateEnrolmentAsync: (
    id: string,
    data: UpdateEnrolmentDataParams,
  ) => Promise<Enrolment>;
  getEnrolmentsByStudentIdAsync: (studentId: string) => Promise<Enrolment[]>;
  getEnrolmentsByClassIdAsync: (classId: string) => Promise<Enrolment[]>;
  getTermsAsync: () => Promise<string[]>;
}

export type { IEnrolmentRepo };
