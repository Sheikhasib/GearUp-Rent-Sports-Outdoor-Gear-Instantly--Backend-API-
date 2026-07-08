import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";
import httpStatus from "http-status";

// Create category controller
const createCategory = catchAsync(async (req, res) => {
  const payload = req.body;

  const category = await categoryService.createCategory(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully.",
    data: category,
  });
});

// Get all categories controller
const getAllCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Categories fetched successfully.",
    data: categories,
  });
});

// Update category controller
const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const category = await categoryService.updateCategory(id as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully.",
    data: category,
  });
});

// Delete category controller
const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  await categoryService.deleteCategory(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category deleted successfully.",
    data: null,
  });
});

export const categoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
