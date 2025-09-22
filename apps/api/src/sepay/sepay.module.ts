import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SePayController } from './sepay.controller';
import { SePayService } from './sepay.service';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { User, UserSchema } from '@api/users/schema/user.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '@api/subscription/schema/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [SePayController],
  providers: [SePayService],
  exports: [SePayService],
})
export class SePayModule {}
