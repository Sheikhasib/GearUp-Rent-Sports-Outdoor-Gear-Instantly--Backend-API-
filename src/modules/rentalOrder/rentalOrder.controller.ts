import { AppError } from "../../utils/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalOrderService } from "./rentalOrder.service";
import httpStatus from "http-status";

// 1. Create rental order controller
const createRentalOrder = catchAsync(async (req, res) => {
  const customerId = req.user?.id as string;
  const payload = req.body;

  if (
    !payload?.gearItemId ||
    !payload?.quantity ||
    !payload?.startDate ||
    !payload?.endDate
  ) {
    throw new AppError(400, "gearItemId, startDate and endDate are required");
  }

  const rentalOrder = await rentalOrderService.createRentalOrder(
    customerId,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental Order created successfully.",
    data: rentalOrder,
  });
});

// 2. Get Customer rental orders controller
const getCustomerRentalOrders = catchAsync(async (req, res) => {
  const customerId = req.user?.id as string;

  const rentalOrders =
    await rentalOrderService.getCustomerRentalOrders(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer Rental Orders retrieved successfully.",
    data: rentalOrders,
  });
});

// 3. Get Provider rental orders controller
const getProviderRentalOrders = catchAsync(async (req, res) => {
  const providerId = req.user?.id as string;

  const rentalOrders =
    await rentalOrderService.getProviderRentalOrders(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Provider Rental Orders retrieved successfully.",
    data: rentalOrders,
  });
});

// 4. Get rental order by id controller
const getRentalOrderById = catchAsync(async (req, res) => {
  const rentalOrderId = req.params.id as string;
  const requesterId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";

  const rentalOrder = await rentalOrderService.getRentalOrderById(
    rentalOrderId,
    requesterId,
    isAdmin,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental Order retrieved successfully.",
    data: rentalOrder,
  });
});

// 5. Cancel rental order controller
const cancelRentalOrder = catchAsync(async (req, res) => {
  const rentalOrderId = req.params.id as string;
  const requesterId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";

  const rentalOrder = await rentalOrderService.cancelRentalOrder(
    rentalOrderId,
    requesterId,
    isAdmin,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental Order cancelled successfully.",
    data: rentalOrder,
  });
});

// 6. Update rental order status controller
const updateRentalOrderStatus = catchAsync(async (req, res) => {
  const rentalOrderId = req.params.id as string;
  const providerId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";
  const rentalOrderStatus = req.body.status;

  const newrentalOrderStatus = await rentalOrderService.updateRentalOrderStatus(
    rentalOrderId,
    providerId,
    isAdmin,
    rentalOrderStatus,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental Order status updated successfully.",
    data: newrentalOrderStatus,
  });
});

export const rentalOrderController = {
  createRentalOrder,
  getCustomerRentalOrders,
  getProviderRentalOrders,
  getRentalOrderById,
  cancelRentalOrder,
  updateRentalOrderStatus,
};
