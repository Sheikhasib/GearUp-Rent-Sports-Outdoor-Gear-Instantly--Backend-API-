import { GearItem } from "../../../generated/prisma/browser";
import { GearItemWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import {
  ICreateGearPayload,
  IGearQuery,
  IUpdateGearPayload,
} from "./gear.interface";

// 1. Create gear service by provider
const createGear = async (providerId: string, payload: ICreateGearPayload) => {
  const {
    name,
    description,
    brand,
    categoryId,
    priceRatePerDay,
    quantity,
    images,
  } = payload;

  // check if category exists
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  const createdGear = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
      availableQuantity: quantity,
    },
  });

  return createdGear;
};

// 2. Get all gears service
const getAllGears = async (query: IGearQuery) => {
  // Pagination
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  // Dynamic Searching and Filtering
  const andConditions: GearItemWhereInput[] = [{ isAvailable: true }];

  // Searching Conditions/Partial Match
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: { contains: query.searchTerm, mode: "insensitive" },
        },
        {
          brand: { contains: query.searchTerm, mode: "insensitive" },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Filtering Condition/Exact Match
  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  // Searching Condition/Partial Match
  if (query.brand) {
    andConditions.push({
      brand: {
        equals: query.brand as string,
        mode: "insensitive",
      },
      //   brand: query.brand,
    });
  }

  // Filtering Condition
  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      priceRatePerDay: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }

  const gearItems = await prisma.gearItem.findMany({
    where: {
      AND: andConditions,
    },
    skip: skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    // include: {
    //   category: {
    //     select: {
    //       id: true,
    //       name: true,
    //     },
    //   },
    // },
  });

  // Get total gear item count for pagination meta data
  const totalGearCount = await prisma.gearItem.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: gearItems,
    meta: {
      page: page,
      limit: limit,
      total: totalGearCount,
      totalPages: Math.ceil(totalGearCount / limit),
    },
  };
};

// 3. Get gear by id service
const getGearById = async (gearId: string) => {
  const gear = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: gearId,
      isAvailable: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              name: true,
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  return gear;
};

// 4. Get My/Provider Gears service
const getMyGears = async (providerId: string) => {
  const myGears = await prisma.gearItem.findMany({
    where: {
      providerId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return myGears;
};

// 5. Update gear service by provider
const updateGear = async (
  gearId: string,
  providerId: string,
  isAdmin: boolean,
  payload: IUpdateGearPayload,
) => {
  // check if gear exists
  const gear = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });

  // check if user is authorized or not to update
  if (gear.providerId !== providerId && !isAdmin) {
    throw new AppError(403, "You are not authorized to update this gear item");
  }

  const updatedGear = await prisma.gearItem.update({
    where: {
      id: gearId,
    },
    data: payload,
  });

  return updatedGear;
};

// 6. Delete/Remove gear service by provider
const deleteGear = async (
  gearId: string,
  providerId: string,
  isAdmin: boolean,
) => {
  // check if gear exists
  const gear = await prisma.gearItem.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });

  // check if user is authorized or not to delete
  if (gear.providerId !== providerId && !isAdmin) {
    throw new AppError(403, "You are not authorized to delete this gear item");
  }

  await prisma.gearItem.delete({
    where: {
      id: gearId,
    },
  });
};

export const gearService = {
  createGear,
  getAllGears,
  getGearById,
  getMyGears,
  updateGear,
  deleteGear,
};
