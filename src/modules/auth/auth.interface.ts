import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IAuth {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
}

export interface ILoginUser {
  email: string;
  password: string;
}
