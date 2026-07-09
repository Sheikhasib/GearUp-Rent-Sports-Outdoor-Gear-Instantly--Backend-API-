import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { adminService } from "./admin.service";

// 1. Get All Users controller
const getAllUsers = catchAsync(async (req, res) => {
  const role = req.query.role as string | undefined;

  const users = await adminService.getAllUsers(role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully.",
    data: users,
  });
});

// 2. Update User Status controller
const updateUserStatus = catchAsync(async (req, res) => {
  const userId = req.params.id as string;
  const status = req.body.status;

  const user = await adminService.updateUserStatus(userId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully.",
    data: user,
  });
});

// 3. Get All Gear Items controller
const getAllGears = catchAsync(async (req, res) => {
  const gears = await adminService.getAllGears();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gears Listing retrieved successfully.",
    data: gears,
  });
});

// 4. Get All Rental Orders controller
const getAllRentalOrders = catchAsync(async (req, res) => {
  const rentalOrders = await adminService.getAllRentalOrders();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental Orders retrieved successfully.",
    data: rentalOrders,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGears,
  getAllRentalOrders,
};
