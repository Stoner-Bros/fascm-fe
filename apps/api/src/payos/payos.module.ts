import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PayosService } from './payos.service';
import { PayosController } from './payos.controller';
import { Payment, PaymentSchema } from '../sepay/schema/payment.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import {
  Subscription,
  SubscriptionSchema,
} from '../subscription/schema/subscription.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  providers: [PayosService],
  exports: [PayosService],
  controllers: [PayosController],
})
export class PayosModule {}
