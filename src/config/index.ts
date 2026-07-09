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
  ssl_commerz_store_id: process.env.SSL_COMMERZ_STORE_ID! as string,
  ssl_commerz_store_passwd: process.env.SSL_COMMERZ_STORE_PASSWORD! as string,
  ssl_commerz_init_url: process.env.SSL_COMMERZ_INIT_URL as string,
  ssl_commerz_validate_url: process.env.SSL_COMMERZ_VALIDATE_URL as string,
  admin_email: process.env.ADMIN_EMAIL as string,
  admin_password: process.env.ADMIN_PASSWORD as string,
};

export default config;
