import axios from "axios";
import { RentalOrder, User } from "../../../generated/prisma/browser";
import config from "../../config";
import { AppError } from "../../utils/appError";
import { prisma } from "../../lib/prisma";

const SSLCOMMERZ_INIT_URL =
  "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const SSLCOMMERZ_VALIDATE_URL =
  "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

// 1. Initiate SSLCommerz payment service
const initiatePayment = async (order: RentalOrder, user: User) => {
  const tranId = `TRNX_ID_${Date.now()}`;

  // 1. Prepare payment data
  const paymentData = {
    store_id: config.ssl_commerz_store_id,
    store_passwd: config.ssl_commerz_store_passwd,
    total_amount: order.totalPrice,
    currency: "BDT",
    tran_id: tranId,
    success_url: `${config.app_url}/api/payments/confirm?orderId=${order.id}&tranId=${tranId}&status=success`,
    fail_url: `${config.app_url}/api/payments/confirm?orderId=${order.id}&tranId=${tranId}&status=fail`,
    cancel_url: `${config.app_url}/api/payments/confirm?orderId=${order.id}&tranId=${tranId}&status=cancel`,
    cus_name: user.name,
    cus_email: user.email,
    cus_add1: "N/A",
    cus_add2: "N/A",
    cus_city: "N/A",
    cus_state: "N/A",
    cus_postcode: 1000,
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
  };

  // 2. Send payment data to SSLCommerz
  const response = await axios.post(SSLCOMMERZ_INIT_URL, paymentData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // 3. Check if payment was successful
  const data = await response.data;

  console.log(data);

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new AppError(
      502,
      `Failed to initiate payment: ${data.failedreason || "unknown error"}`,
    );
  }

  // create payment
  await prisma.payment.create({
    data: {
      tranId,
      orderId: order.id,
      amount: order.totalPrice as any,
      provider: "SSLCommerz",
      method: null,
      //   status: "PENDING",
    },
  });

  const GatewayPageURL = data.GatewayPageURL as string;

  return {
    paymentUrl: GatewayPageURL,
    tranId,
  };
};

// 2. Create payment session
const createPaymentSession = async (
  customerId: string,
  rentalOrderId: string,
) => {
  const order = await prisma.rentalOrder.findUniqueOrThrow({
    where: {
      id: rentalOrderId,
    },
    include: {
      customer: true,
    },
  });

  // Check if order belongs to the customer
  if (order.customerId !== customerId) {
    throw new AppError(
      403,
      "You do not have permission to pay for this order.",
    );
  }

  // Initiate payment
  const paymentUrl = await initiatePayment(order, order.customer);

  return { paymentUrl };
};

// 3. Confirm payment
const confirmPayment = async (
  orderId: string,
  tranId: string,
  payload: Record<string, unknown>,
) => {
  // Check if payment is already processed
  const existingPayment = await prisma.payment.findUniqueOrThrow({
    where: { tranId },
  });

  if (existingPayment.status === "PAID") {
    // Already processed - SSLCommerz can call this more than once
    return { alreadyProcessed: true, status: existingPayment.status };
  }

  // Validate payment from SSLCommerz
  const response = await axios.post(
    `${SSLCOMMERZ_VALIDATE_URL}?val_id=${payload.val_id}&store_id=${config.ssl_commerz_store_id}&store_passwd=${config.ssl_commerz_store_passwd}&format=json`,
    {},
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  // Check if payment was successful
  const data = await response.data;

  if (data.status === "VALID" || data.status === "VALIDATED") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { tranId },
        data: {
          status: "PAID",
          provider: "SSLCommerz",
          method: typeof data.card_type === "string" ? data.card_type : null,
          paidAt: new Date(),
          meta: payload as any,
        },
      });

      const order = await tx.rentalOrder.findUniqueOrThrow({
        where: { id: orderId },
      });

      // Only move CONFIRMED -> PAID; don't force an illegal transition
      // if the order is already past that point.
      if (order.status === "CONFIRMED") {
        await tx.rentalOrder.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
      }
    });

    // Return success
    return { alreadyProcessed: false, status: "PAID" };
  }

  // Payment failed - SSLCommerz can call this more than once
  await prisma.payment.update({
    where: { tranId },
    data: {
      status: "FAILED",
      provider: "SSLCommerz",
      method: typeof data.card_type === "string" ? data.card_type : null,
      meta: payload as any,
    },
  });

  // Return failure
  return { alreadyProcessed: false, status: "FAILED" };
};

// 4. Get Customer payment
const getCustomerPayment = async (customerId: string) => {
  const customerPayment = await prisma.payment.findMany({
    where: {
      order: {
        customerId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      order: {
        select: {
          id: true,
          gearItem: { select: { name: true } },
        },
      },
    },
  });

  return customerPayment;
};

// 5. Get Payment By Id
const getPaymentById = async (
  paymentId: string,
  customerId: string,
  isAdmin: boolean,
) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      order: true,
    },
  });

  if (payment.order.customerId !== customerId && !isAdmin) {
    throw new AppError(403, "You do not have permission to view this payment.");
  }

  return payment;
};

export const paymentService = {
  initiatePayment,
  createPaymentSession,
  confirmPayment,
  getCustomerPayment,
  getPaymentById,
};
