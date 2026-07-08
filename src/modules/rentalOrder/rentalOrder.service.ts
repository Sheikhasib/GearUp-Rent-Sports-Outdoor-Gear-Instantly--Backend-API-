import { RentalOrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateRentalOrderPayload } from "./rentalOrder.interface";

// The allowed transitions for each order status (update order status logic)
const ALLOWED_TRANSITIONS: Record<RentalOrderStatus, RentalOrderStatus[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

// Milliseconds in one day
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Calculates the number of days between two dates
const calculateRentalDays = (startDate: Date, endDate: Date) => {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / MS_PER_DAY,
  );
  return Math.max(days, 1);
};

// Interval-overlap check across every order that's still "live" for this gear item, so a new booking can't over-commit units already held by another customer for overlapping dates. / Check how many units are already booked
const getBookedQuantity = async (
  gearItemId: string,
  startDate: Date,
  endDate: Date,
) => {
  const overlapping = await prisma.rentalOrder.findMany({
    where: {
      gearItemId,
      status: {
        in: ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"],
      },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    select: { quantity: true },
  });

  const totalBookedQuantity = overlapping.reduce(
    (sum, rental) => sum + rental.quantity,
    0,
  );

  return totalBookedQuantity;
};

// 1. Create rental order service
const createRentalOrder = async (
  customerId: string,
  payload: ICreateRentalOrderPayload,
) => {
  // 1. Convert strings to dates (UTC)
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new AppError(400, "Invalid startDate or endDate");
  }

  // 2. Default quantity to 1 if not provided
  const quantity = payload.quantity || 1;

  // 3. Validate date order
  if (endDate <= startDate) {
    throw new AppError(400, "End date must be after start date");
  }

  // 3. Find gear item
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: payload.gearItemId,
    },
  });

  // 5. Check gear exists and is active
  if (!gear || !gear.isAvailable) {
    throw new AppError(404, "Gear item not found or is no longer available");
  }

  // 6. Find overlapping orders for same gear item / check quantity
  const booked = await getBookedQuantity(
    payload.gearItemId,
    startDate,
    endDate,
  );

  // 7. Calculate remaining stock
  const remaining = gear.quantity - booked;

  // 8. Reject if requested quantity is too high
  if (quantity > remaining) {
    throw new AppError(
      400,
      `Only ${remaining} unit(s) of this gear are available for the selected dates`,
    );
  }

  // 9. Calculate rental days
  const rentalDays = calculateRentalDays(startDate, endDate);

  // 10. Calculate total price
  const totalPrice = Number(gear.priceRatePerDay) * quantity * rentalDays;

  // 11. Create rental order
  const createdRentalOrder = prisma.rentalOrder.create({
    data: {
      customerId,
      gearItemId: payload.gearItemId,
      startDate, // use converted Date object
      endDate, // use converted Date object
      quantity, // use defaulted quantity value
      totalPrice,
      status: "PLACED",
    },
    include: {
      gearItem: {
        select: {
          name: true,
          priceRatePerDay: true,
          images: true,
        },
      },
    },
  });

  return createdRentalOrder;
};

// 2. Get Customer rental orders service
const getCustomerRentalOrders = async (customerId: string) => {
  const rentalOrders = await prisma.rentalOrder.findMany({
    where: {
      customerId,
    },
    include: {
      gearItem: {
        select: {
          name: true,
          priceRatePerDay: true,
          images: true,
        },
      },
      payments: {
        select: {
          status: true,
          tranId: true,
          amount: true,
        },
      },
    },
  });

  return rentalOrders;
};

// 3. Get Provider rental orders service
const getProviderRentalOrders = async (providerId: string) => {
  const rentalOrders = await prisma.rentalOrder.findMany({
    where: {
      gearItem: {
        providerId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      gearItem: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true, phone: true } },
      payments: { select: { status: true } },
    },
  });

  return rentalOrders;
};

// 4. Get rental order by id service
const getRentalOrder = async (rentalOrderId: string) => {};

// 5. Cancel rental order service
const cancelRentalOrder = async (rentalOrderId: string) => {};

// 6. Update rental order service by provider
const updateRentalOrder = async (rentalOrderId: string) => {};

export const rentalOrderService = {
  createRentalOrder,
  getCustomerRentalOrders,
  getProviderRentalOrders,
  getRentalOrder,
  cancelRentalOrder,
  updateRentalOrder,
};
