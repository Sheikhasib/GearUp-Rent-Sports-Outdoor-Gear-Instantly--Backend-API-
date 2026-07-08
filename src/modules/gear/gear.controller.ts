import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { gearService } from "./gear.service";
import httpStatus from "http-status";

// 1. Create gear controller by provider
const createGear = catchAsync(async (req, res) => {
  const providerId = req.user?.id as string;
  const payload = req.body;

  const gear = await gearService.createGear(providerId, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear created successfully.",
    data: gear,
  });
});

// 2. Get all gears controller
const getAllGears = catchAsync(async (req, res) => {
  const query = req.query;
  //   console.log(query);

  const gears = await gearService.getAllGears(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Gears retrieved successfully.",
    data: gears.data,
    meta: gears.meta,
  });
});

// 3. Get gear details by id controller
const getGearById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const gear = await gearService.getGearById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully.",
    data: gear,
  });
});

// 4. Get My/Provider Gears controller
const getMyGears = catchAsync(async (req, res) => {
  const providerId = req.user?.id as string;

  const gears = await gearService.getMyGears(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My Gears are retrieved successfully.",
    data: gears,
  });
});

// 5. Update gear controller by provider
const updateGear = catchAsync(async (req, res) => {
  const gearId = req.params.id as string;
  const providerId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";
  const payload = req.body;

  const updatedGear = await gearService.updateGear(
    gearId,
    providerId,
    isAdmin,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear updated successfully.",
    data: updatedGear,
  });
});

// 6. Delete/Remove gear controller by provider
const deleteGear = catchAsync(async (req, res) => {
  const gearId = req.params.id as string;
  const providerId = req.user?.id as string;
  const isAdmin = req.user?.role === "ADMIN";

  await gearService.deleteGear(gearId, providerId, isAdmin);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear deleted successfully.",
    data: null,
  });
});

export const gearController = {
  createGear,
  getAllGears,
  getGearById,
  getMyGears,
  updateGear,
  deleteGear,
};
