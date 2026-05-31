import { Payment } from "../../types";
import {
  CreatePaymentDataParams,
  GetPaymentsResponse,
  UpdatePaymentDataParams,
} from "../../types/payment";

interface IPaymentRepo {
  getPaymentsAsync: () => Promise<GetPaymentsResponse>;
  getPaymentsByStudentIdAsync: (studentId: string) => Promise<GetPaymentsResponse>;
  createPaymentAsync: (data: CreatePaymentDataParams) => Promise<Payment>;
  updatePaymentAsync: (
    paymentId: number,
    data: UpdatePaymentDataParams,
  ) => Promise<Payment>;
  deletePaymentAsync: (paymentId: number) => Promise<void>;
}

export type { IPaymentRepo };
