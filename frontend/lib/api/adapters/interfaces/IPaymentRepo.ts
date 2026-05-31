import { Payment } from "../../types";
import {
  CreatePaymentDataParams,
  GetPaymentStatusesResponse,
  GetPaymentTypesResponse,
  GetPaymentsResponse,
  UpdatePaymentDataParams,
} from "../../types/payment";

interface IPaymentRepo {
  getPaymentsAsync: () => Promise<GetPaymentsResponse>;
  getPaymentTypesAsync: () => Promise<GetPaymentTypesResponse>;
  getPaymentStatusesAsync: () => Promise<GetPaymentStatusesResponse>;
  getPaymentsByStudentIdAsync: (studentId: string) => Promise<GetPaymentsResponse>;
  createPaymentAsync: (data: CreatePaymentDataParams) => Promise<Payment>;
  updatePaymentAsync: (
    paymentId: number,
    data: UpdatePaymentDataParams,
  ) => Promise<Payment>;
  deletePaymentAsync: (paymentId: number) => Promise<void>;
}

export type { IPaymentRepo };
