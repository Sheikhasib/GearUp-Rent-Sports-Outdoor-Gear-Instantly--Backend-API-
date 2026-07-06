import dotenv from "dotenv";
import path from "path";

dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT,
  app_url: process.env.APP_URL,
  database_url: process.env.DATABASE_URL || "",
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS as string,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN as string,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string,
  stripe_product_price_id: process.env.STRIPE_PRODUCT_PRICE_ID as string,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY as string,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
};

export default config;
