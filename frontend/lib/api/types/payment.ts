import { Payment, PaymentWithDetails } from ".";
import { PaymentStatus, PaymentType } from ".";

type GetPaymentsResponse = PaymentWithDetails[];
type GetPaymentTypesResponse = PaymentType[];
type GetPaymentStatusesResponse = PaymentStatus[];
type CreatePaymentDataParams = Omit<Payment, "payment_id">;
type UpdatePaymentDataParams = Partial<Omit<Payment, "payment_id">>;

export type {
  CreatePaymentDataParams,
  GetPaymentStatusesResponse,
  GetPaymentTypesResponse,
  GetPaymentsResponse,
  UpdatePaymentDataParams,
};
