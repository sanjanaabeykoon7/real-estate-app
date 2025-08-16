import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ListingsModule } from './listings/listings.module';
import { ListingsController, AdminListingsController } from './listings/listings.controller';
import { ListingsService } from './listings/listings.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads packages/api/.env
    ListingsModule,
  ],
  controllers: [AppController, ListingsController, AdminListingsController],
  providers: [AppService, ListingsService],
})
export class AppModule {}
