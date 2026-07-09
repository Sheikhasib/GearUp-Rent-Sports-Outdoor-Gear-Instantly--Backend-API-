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
const updateUserStatus = catchAsync(async (req, res) => {});

// 3. Get All Gear Items controller
const getAllGears = catchAsync(async (req, res) => {});

// 4. Get All Rental Orders controller
const getAllRentalOrders = catchAsync(async (req, res) => {});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGears,
  getAllRentalOrders,
};
