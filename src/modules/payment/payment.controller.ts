import { AppError } from "../../utils/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import httpStatus from "http-status";

// 1. Create payment controller
const createPaymentSession = catchAsync(async (req, res) => {
  const customerId = req.user?.id as string;
  const rentalOrderId = req.body.rentalOrderId;

  if (!rentalOrderId) {
    throw new AppError(400, "Rental order id is required");
  }

  const paymentSession = await paymentService.createPaymentSession(
    customerId,
    rentalOrderId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment session created successfully.",
    data: paymentSession,
  });
});

// 2. Confirm payment controller
const confirmPayment = catchAsync(async (req, res) => {
  const { orderId, tranId } = req.query;
  const payload = req.body;

  if (!orderId || !tranId) {
    throw new AppError(400, "rentalOrderId and tranId are required");
  }

  const response = await paymentService.confirmPayment(
    orderId as string,
    tranId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:
      response.status === "PAID"
        ? "Payment confirmed successfully"
        : "Payment could not be verified",
    data: response,
  });
});

// 3. Get Customer payment history controller
const getCustomerPayment = catchAsync(async (req, res) => {
  const customerId = req.user?.id as string;

  const response = await paymentService.getCustomerPayment(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer payment retrieved successfully.",
    data: response,
  });
});

// 4. Get Payment Details By Id controller
const getPaymentById = catchAsync(async (req, res) => {
  const paymentId = req.params.id as string;
  const customerId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";

  const response = await paymentService.getPaymentById(
    paymentId,
    customerId,
    isAdmin,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment retrieved successfully.",
    data: response,
  });
});

export const paymentController = {
  createPaymentSession,
  confirmPayment,
  getCustomerPayment,
  getPaymentById,
};
