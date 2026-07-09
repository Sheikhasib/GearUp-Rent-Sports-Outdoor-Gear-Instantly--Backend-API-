import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateReviewPayload } from "./review.interface";

// Create review controller
const createReview = async (
  customerId: string,
  payload: ICreateReviewPayload,
) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({
    where: {
      id: payload.renatalOrderId,
    },
    include: {
      review: true,
    },
  });

  if (order.customerId !== customerId) {
    throw new AppError(403, "You can only review your own rentals");
  }

  if (order.review) {
    throw new AppError(400, "You have already reviewed this rental");
  }

  if (order.status !== "RETURNED") {
    throw new AppError(
      400,
      "You can only review gear after it has been returned",
    );
  }

  const createdReview = await prisma.review.create({
    data: {
      customerId,
      gearItemId: order.gearItemId,
      rentalOrderId: order.id,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
};

export const reviewService = { createReview };
