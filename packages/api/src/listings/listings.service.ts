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
}