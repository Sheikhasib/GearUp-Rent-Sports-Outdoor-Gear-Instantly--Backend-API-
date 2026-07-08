import { GearItemWhereInput } from "../../../generated/prisma/models";

export interface ICreateGearPayload {
  name: string;
  description: string;
  brand?: string;
  categoryId: string;
  priceRatePerDay: number;
  quantity: number;
  images?: string[];
}

export interface IGearQuery extends GearItemWhereInput {
  searchTerm?: string;

  minPrice?: string;
  maxPrice?: string;

  page?: string;
  limit?: string;

  sortBy?: string;
  sortOrder?: string;
}

export interface IUpdateGearPayload {
  name?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  priceRatePerDay?: number;
  quantity?: number;
  images?: string[];
}
