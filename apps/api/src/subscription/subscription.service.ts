import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './schema/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subsciption.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionModel.find();
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = new this.subscriptionModel(createSubscriptionDto);
    return subscription.save();
  }

  async update(
    id: string,
    updateSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findByIdAndUpdate(
      id,
      updateSubscriptionDto,
      { new: true },
    );
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async delete(id: string): Promise<void> {
    const subscription = await this.subscriptionModel.findByIdAndDelete(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
  }
}
