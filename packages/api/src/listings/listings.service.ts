import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ListingsService {
  private prisma = new PrismaClient();

  findAll() {
    return this.prisma.listing.findMany({ where: { published: true } });
  }

  findOne(id: string) {
    return this.prisma.listing.findUnique({ where: { id } });
  }

  async findAllAdmin() {
    return this.prisma.listing.findMany({
      include: { owner: { select: { id: true, name: true } } },
    });
  }

  async search(filters: any) {
    const where: any = { published: true };
    if (filters.city) where.address = { path: ['city'], equals: filters.city };
    if (filters.minPrice) where.price = { gte: filters.minPrice };
    if (filters.maxPrice) where.price = { lte: filters.maxPrice };
    if (filters.beds) where.beds = filters.beds;
    if (filters.baths) where.baths = filters.baths;
    return this.prisma.listing.findMany({ where, include: { owner: true } });
  }
}