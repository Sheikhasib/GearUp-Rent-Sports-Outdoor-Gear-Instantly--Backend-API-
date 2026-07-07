import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { IAuth, ILoginUser } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";

// Register service
const registerUser = async (payload: IAuth) => {
  const { id, name, email, password, role, phone } = payload;

  // Only customers/providers can self-register; admins are seeded separately
  if (role && role !== "CUSTOMER" && role !== "PROVIDER") {
    throw new Error("Role must be either CUSTOMER or PROVIDER");
  }

  // Check if user with the same email already exists
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

// Login service
const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  // check if user exists, if not throw error
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  // check if user is suspended
  if (user.status === "SUSPENDED") {
    throw new Error("User is suspended. Please contact support service.");
  }

  // check if password matches, if not throw error
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expires_in } as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expires_in } as SignOptions,
  );

  return { accessToken, refreshToken };
};

// Get Me service
const getMeFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  getMeFromDB,
};
