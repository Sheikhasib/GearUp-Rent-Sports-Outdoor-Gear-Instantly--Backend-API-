import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

// Create review controller
const createReview = catchAsync(async (req, res) => {
  const customerId = req.user?.id as string;
  const payload = req.body;

  const review = await reviewService.createReview(customerId, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully.",
    data: review,
  });
});

export const reviewController = { createReview };
