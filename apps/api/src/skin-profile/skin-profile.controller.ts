import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { SkinProfileService, PaginationParams } from './skin-profile.service';
import { CreateSkinQuestionDto } from './dto/create-skin-question.dto';
import { UpdateSkinQuestionDto } from './dto/update-skin-question.dto';
import { SubmitSkinProfileDto } from './dto/submit-skin-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@api/casl/guards/roles.guard';
import { Role } from '@api/roles/enums/role.enum';
import { Roles } from '@api/casl/decorators/roles.decorator';

@ApiTags('skin-profile')
@Controller('skin-profile')
@UseGuards(AuthGuard(['api-key', 'jwt']), RolesGuard)
@ApiSecurity('API-Key-auth')
@ApiBearerAuth('JWT-auth')
export class SkinProfileController {
  constructor(private readonly skinProfileService: SkinProfileService) {}

  // Admin endpoints for managing questions
  @Post('questions')
  @ApiOperation({ summary: 'Create a new skin profile question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @Roles(Role.ADMIN)
  createQuestion(@Body() createSkinQuestionDto: CreateSkinQuestionDto) {
    return this.skinProfileService.createQuestion(createSkinQuestionDto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all skin profile questions with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated questions' })
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
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g. order, question)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (asc or desc)',
  })
  findAllQuestions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const paginationParams: PaginationParams = {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      sortBy,
      sortOrder,
    };
    return this.skinProfileService.findAllQuestions(paginationParams);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get specific skin profile question' })
  @ApiResponse({ status: 200, description: 'Return the question' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  findQuestionById(@Param('id') id: string) {
    return this.skinProfileService.findQuestionById(id);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update a skin profile question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Roles(Role.ADMIN)
  updateQuestion(
    @Param('id') id: string,
    @Body() updateSkinQuestionDto: UpdateSkinQuestionDto,
  ) {
    return this.skinProfileService.updateQuestion(id, updateSkinQuestionDto);
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Delete a skin profile question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @Roles(Role.ADMIN)
  removeQuestion(@Param('id') id: string) {
    return this.skinProfileService.removeQuestion(id);
  }

  // User endpoints for submitting and retrieving skin profiles
  @Post()
  @ApiOperation({ summary: 'Submit skin profile answers' })
  @ApiResponse({
    status: 201,
    description: 'Skin profile submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (missing required questions or invalid data)',
  })
  submitSkinProfile(
    @Request() req: any,
    @Body() submitDto: SubmitSkinProfileDto,
  ) {
    return this.skinProfileService.submitSkinProfile(req.user.id, submitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user skin profile' })
  @ApiResponse({ status: 200, description: 'Return the user skin profile' })
  @ApiResponse({ status: 404, description: 'Skin profile not found' })
  getUserSkinProfile(@Request() req: any) {
    return this.skinProfileService.getUserSkinProfile(req.user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete current user skin profile' })
  @ApiResponse({
    status: 200,
    description: 'Skin profile deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Skin profile not found' })
  deleteUserSkinProfile(@Request() req: any) {
    return this.skinProfileService.deleteUserSkinProfile(req.user.id);
  }

  // Admin endpoint to get user skin profile
  @Get('users/:userId')
  @ApiOperation({ summary: 'Get skin profile for specific user (Admin)' })
  @ApiResponse({ status: 200, description: 'Return the user skin profile' })
  @ApiResponse({ status: 404, description: 'Skin profile not found' })
  @Roles(Role.ADMIN)
  getUserSkinProfileByAdmin(@Param('userId') userId: string) {
    return this.skinProfileService.getUserSkinProfile(userId);
  }
}
