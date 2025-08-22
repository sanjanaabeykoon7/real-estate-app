import { Controller, Get, UseGuards, SetMetadata, Param, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { RoleGuard } from '../auth/auth.guard';   // ← your new guard

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  getAll() {
    return this.listingsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Get('search')
  async search(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('beds') beds?: number,
    @Query('baths') baths?: number,
  ) {
    return this.listingsService.search({ city, minPrice, maxPrice, beds, baths });
  }
}

@Controller('admin/listings')   // separate route for admin
export class AdminListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['SUPER_ADMIN', 'MODERATOR'])
  getAdminListings() {
    return this.listingsService.findAllAdmin(); // or reuse findAll
  }

  @Get('search')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['SUPER_ADMIN', 'MODERATOR'])
  async adminSearch(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('beds') beds?: number,
    @Query('baths') baths?: number,
  ) {
    return this.listingsService.search({ city, minPrice, maxPrice, beds, baths });
  }
}