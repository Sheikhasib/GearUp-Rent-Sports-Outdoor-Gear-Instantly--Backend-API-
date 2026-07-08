import { RentalOrderStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

// The allowed transitions for each order status (update order status logic)
export const ALLOWED_TRANSITIONS: Record<
  RentalOrderStatus,
  RentalOrderStatus[]
> = {
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
export const calculateRentalDays = (startDate: Date, endDate: Date) => {
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / MS_PER_DAY,
  );
  return Math.max(days, 1);
};

// Interval-overlap check across every order that's still "live" for this gear item, so a new booking can't over-commit units already held by another customer for overlapping dates. / Check how many units are already booked
export const getBookedQuantity = async (
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
