import { Enrolment } from ".";

// Add "additional notes" for enrolment?
type CreateEnrolmentDataParams = Omit<Enrolment, "enrolment_id">;

type UpdateEnrolmentDataParams = Pick<CreateEnrolmentDataParams, "enrolment_date">;

export type { CreateEnrolmentDataParams, UpdateEnrolmentDataParams };
