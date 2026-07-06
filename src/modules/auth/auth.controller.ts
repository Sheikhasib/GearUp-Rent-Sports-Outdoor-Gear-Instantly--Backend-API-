import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

// Register controller
const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

// Login controller
const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

// Get Me controller
const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const authController = {
  register,
  login,
  getMe,
};
