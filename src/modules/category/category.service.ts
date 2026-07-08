import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Create category service
const createCategory = async (payload: ICreateCategory) => {
  const slug = slugify(payload.name);

  // Check if category with the same slug already exists
  const isCategoryExists = await prisma.category.findFirst({
    where: {
      OR: [{ name: payload.name }, { slug }],
    },
  });

  if (isCategoryExists) {
    throw new AppError(409, "A category with this name already exists");
  }

  const createdCategory = await prisma.category.create({
    data: {
      name: payload.name,
      slug,
    },
  });

  return createdCategory;
};

// Get all categories service
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

// Update category service
const updateCategory = async (categoryId: string, payload: IUpdateCategory) => {
  const { name } = payload;

  // check if category already exists
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  // check if name is provided, if so update name and slug
  const data: Partial<IUpdateCategory> = {};

  if (payload.name) {
    data.name = payload.name;
    data.slug = slugify(payload.name);
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data,
  });

  return updatedCategory;
};

// Delete category service
const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  // check if category has associated gear items
  const gearCount = await prisma.gearItem.count({
    where: {
      categoryId: category.id,
    },
  });

  // throw error if category has associated gear items
  if (gearCount > 0) {
    throw new AppError(
      409,
      "Cannot delete category with associated gear items",
    );
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
