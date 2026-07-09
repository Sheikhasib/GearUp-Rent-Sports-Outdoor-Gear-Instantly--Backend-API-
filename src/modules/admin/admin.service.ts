import { prisma } from "../../lib/prisma";

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

export const adminService = {
  getAllUsers,
};
