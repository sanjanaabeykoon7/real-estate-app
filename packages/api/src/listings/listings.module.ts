import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { AdminListingsController } from './listings.controller'; // <-- NEW
import { ListingsService } from './listings.service';

@Module({
  controllers: [ListingsController, AdminListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}