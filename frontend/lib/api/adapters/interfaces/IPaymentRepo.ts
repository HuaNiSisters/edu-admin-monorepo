import { GetPaymentsResponse } from "../../types/payment";

interface IPaymentRepo {
  getPaymentsAsync: () => Promise<GetPaymentsResponse>;
}

export type { IPaymentRepo };
