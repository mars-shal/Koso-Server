import { Module } from '@nestjs/common';
import { PaymentLinksController } from './payment-links.controller.js';
import { PaymentLinksService } from './payment-links.service.js';

@Module({
  controllers: [PaymentLinksController],
  providers: [PaymentLinksService],
})
export class PaymentLinksModule {}
