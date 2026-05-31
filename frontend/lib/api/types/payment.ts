import { Payment, PaymentWithDetails } from ".";

type GetPaymentsResponse = PaymentWithDetails[];
type CreatePaymentDataParams = Omit<Payment, "payment_id">;
type UpdatePaymentDataParams = Partial<Omit<Payment, "payment_id">>;

export type {
  CreatePaymentDataParams,
  GetPaymentsResponse,
  UpdatePaymentDataParams,
};
