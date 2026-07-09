import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";

// 1. Get All Users service
const getAllUsers = async (role?: string) => {
  const allUsers = await prisma.user.findMany({
    where: role ? { role: role as any } : {},
    omit: {
      password: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return allUsers;
};

// 2. Update User Status service
const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  // Check if user is admin
  if (user.role === "ADMIN") {
    throw new AppError(400, "Admin accounts cannot be suspended");
  }

  const updatedUserStatus = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUserStatus;
};

// 3. Get All Gear Items service
const getAllGears = async () => {
  const allGears = await prisma.gearItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return allGears;
};

// 4. Get All Rental Orders service
const getAllRentalOrders = async () => {
  const allRentalOrders = await prisma.rentalOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gearItem: {
        select: {
          id: true,
          name: true,
          providerId: true,
        },
      },
      payments: {
        select: { status: true },
      },
    },
  });

  return allRentalOrders;
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllGears,
  getAllRentalOrders,
};
