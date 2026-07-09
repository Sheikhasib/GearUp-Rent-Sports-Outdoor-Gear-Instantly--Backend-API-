import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

// 1. Get All Users controller
const getAllUsers = catchAsync(async (req, res) => {
  const role = req.query.role as string | undefined;

  const users = await userService.getAllUsers(role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully.",
    data: users,
  });
});

export const adminController = {
  getAllUsers,
};
