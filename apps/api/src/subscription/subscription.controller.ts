import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './schema/subscription.schema';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@api/casl/guards/roles.guard';
import { CreateSubscriptionDto } from './dto/create-subsciption.dto';
import { Roles } from '@api/casl/decorators/roles.decorator';
import { Role } from '@api/roles/enums/role.enum';

@Controller('subscription')
@ApiTags('subscription')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), RolesGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The subscriptions have been successfully retrieved.',
  })
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The subscription has been successfully retrieved.',
  })
  async findOne(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The subscription has been successfully created.',
  })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The subscription has been successfully updated.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The subscription has been successfully deleted.',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.delete(id);
  }
}
