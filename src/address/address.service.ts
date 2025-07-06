import prisma from "../../db/prisma.js";
import { AppError } from "../common/errors/app.error.js";

export class AddressService {
  async createAddress(
    userId: string,
    address: string,
    state?: string,
    country?: string,
    isDefault: boolean = false
  ) {
    const existing = await prisma.address.findFirst({
      where: {
        userId,
        address: { equals: address, mode: "insensitive" },
        state: state ? { equals: state, mode: "insensitive" } : undefined,
        country: country ? { equals: country, mode: "insensitive" } : undefined,
      },
    });
    if (existing) {
      throw new AppError("Address already exists for this user", 409);
    }
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.address.create({
      data: { userId, address, state, country, isDefault },
    });
  }

  async getAddressesByUser(userId: string) {
    return prisma.address.findMany({ where: { userId } });
  }

  async getAddressById(userId: string, id: string) {
    return prisma.address.findFirst({ where: { id, userId } });
  }

  async updateAddress(
    userId: string,
    id: string,
    address: string,
    state?: string,
    country?: string,
    isDefault: boolean = false
  ) {
    const existing = await prisma.address.findFirst({
      where: {
        userId,
        id: { not: id },
        address: { equals: address, mode: "insensitive" },
        state: state ? { equals: state, mode: "insensitive" } : undefined,
        country: country ? { equals: country, mode: "insensitive" } : undefined,
      },
    });
    if (existing) {
      throw new AppError("Address already exists for this user", 409);
    }
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.address.update({
      where: { id },
      data: { address, state, country, isDefault },
    });
  }

  async deleteAddress(userId: string, id: string) {
    return prisma.address.deleteMany({ where: { id, userId } });
  }
}
