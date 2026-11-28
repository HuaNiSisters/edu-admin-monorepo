import { Payment, PaymentWithDetails } from ".";
import { PaymentStatus, PaymentType } from ".";

type GetPaymentsResponse = PaymentWithDetails[];
type GetPaymentTypesResponse = PaymentType[];
type GetPaymentStatusesResponse = PaymentStatus[];
type CreatePaymentDataParams = Omit<Payment, "payment_id" | "follow_up_date"> &
  Partial<Pick<Payment, "follow_up_date">>;
type UpdatePaymentDataParams = Partial<Omit<Payment, "payment_id">>;

export type {
  CreatePaymentDataParams,
  GetPaymentStatusesResponse,
  GetPaymentTypesResponse,
  GetPaymentsResponse,
  UpdatePaymentDataParams,
};
