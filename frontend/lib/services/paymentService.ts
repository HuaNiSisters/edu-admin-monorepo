import { IPaymentRepo } from "../api/adapters/interfaces";

function PaymentService(paymentRepo: IPaymentRepo) {
  async function getPaymentsAsync() {
    return await paymentRepo.getPaymentsAsync();
  }

  async function getPaymentTypesAsync() {
    return await paymentRepo.getPaymentTypesAsync();
  }

  async function getPaymentStatusesAsync() {
    return await paymentRepo.getPaymentStatusesAsync();
  }

  async function getPaymentsByStudentIdAsync(studentId: string) {
    return await paymentRepo.getPaymentsByStudentIdAsync(studentId);
  }

  async function createPaymentAsync(
    data: Parameters<IPaymentRepo["createPaymentAsync"]>[0],
  ) {
    return await paymentRepo.createPaymentAsync(data);
  }

  async function updatePaymentAsync(
    paymentId: number,
    data: Parameters<IPaymentRepo["updatePaymentAsync"]>[1],
  ) {
    return await paymentRepo.updatePaymentAsync(paymentId, data);
  }

  async function deletePaymentAsync(paymentId: number) {
    return await paymentRepo.deletePaymentAsync(paymentId);
  }

  return {
    createPaymentAsync,
    deletePaymentAsync,
    getPaymentStatusesAsync,
    getPaymentTypesAsync,
    getPaymentsAsync,
    getPaymentsByStudentIdAsync,
    updatePaymentAsync,
  };
}

export default PaymentService;
