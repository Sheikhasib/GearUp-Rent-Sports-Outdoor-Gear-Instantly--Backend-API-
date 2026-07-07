import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

// auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN)
// auth() => ...requiredRoles => [Role.CUSTOMER, Role.PROVIDER, Role.ADMIN]
const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accesstoken
      ? req.cookies.accesstoken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    // 1. check if token is present or not
    if (!token) {
      throw new AppError(
        401,
        "You are not logged in. Please login to continue.",
      );
    }

    // 2. verify token and get verifiedToken
    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret,
    ) as JwtPayload;

    // 3. check if verifiedToken is not success
    if (!verifiedToken.success) {
      throw new AppError(403, verifiedToken.error);
    }

    // Destructuring properties from verifiedToken
    const { id, name, email, role } = verifiedToken.data as JwtPayload;

    // 4. check if role is in requiredRoles array
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        403,
        "Forbidden!!!. You are not authorized to access this route.",
      );
    }

    // 5. check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    // check if user is not found
    if (!user) {
      throw new AppError(401, "User not found.");
    }

    // 6. check if user is suspended
    if (user.status === "SUSPENDED") {
      throw new AppError(
        403,
        "User is suspended. Please contact support service.",
      );
    }

    // 7. add/attach user to request
    req.user = {
      id,
      name,
      email,
      role,
    };

    // call the next middleware otherwise the request will be blocked
    next();
  });
};

export default auth;
