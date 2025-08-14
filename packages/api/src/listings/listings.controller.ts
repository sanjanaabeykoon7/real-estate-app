import { Controller, Get, Param } from '@nestjs/common';
import { ListingsService } from './listings.service';

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
}