import { Enrolment } from ".";

// Add "additional notes" for enrolment?
type CreateEnrolmentDataParams = Omit<Enrolment, "enrolment_id">;

 // Only status for enrolment can be updated. Maybe also "notes" in the future
type UpdateEnrolmentDataParams = Pick<CreateEnrolmentDataParams, "status">;

export type { CreateEnrolmentDataParams, UpdateEnrolmentDataParams };
