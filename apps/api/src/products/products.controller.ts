import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '@api/casl/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@api/roles/enums/role.enum';
import { Roles } from '@api/casl/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated products.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
  })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    limit = Math.min(limit, 100);
    return this.productsService.findAll(page, limit);
  }

  @Get('brand/:brand')
  @ApiOperation({ summary: 'Get products by brand with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated products for a specific brand.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
  })
  findByBrand(
    @Param('brand') brand: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    limit = Math.min(limit, 100);
    return this.productsService.findByBrand(brand, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all products from database' })
  @ApiResponse({
    status: 200,
    description: 'All products have been successfully deleted.',
  })
  @Roles(Role.ADMIN)
  clearAll() {
    return this.productsService.clearAll();
  }
}
