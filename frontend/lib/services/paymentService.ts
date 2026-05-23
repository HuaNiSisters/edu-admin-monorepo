import { IPaymentRepo } from "../api/adapters/interfaces";

function PaymentService(paymentRepo: IPaymentRepo) {
  async function getPaymentsAsync() {
    return await paymentRepo.getPaymentsAsync();
  }

  return {
    getPaymentsAsync,
  };
}

export default PaymentService;
