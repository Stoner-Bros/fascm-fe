import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { BlogService, PaginationParams } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@api/casl/guards/roles.guard';
import { Roles } from '@api/casl/decorators/roles.decorator';
import { Role } from '@api/roles/enums/role.enum';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'The blog has been successfully created.',
  })
  create(@Body() createBlogDto: CreateBlogDto, @Request() req: any) {
    // Always use the authenticated user
    return this.blogService.create(createBlogDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated blog posts.' })
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
    description: 'Field to sort by (e.g. createdAt, title)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (asc or desc)',
  })
  findAll(
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
    return this.blogService.findAll(paginationParams);
  }

  // My Blogs - Moved before parameterized routes
  @Get('my-blogs')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Get all blogs created by the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The blogs have been successfully retrieved.',
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
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g. createdAt, title)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (asc or desc)',
  })
  getMyBlogs(
    @Request() req: any,
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
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.blogService.getMyBlogs(req.user.id, paginationParams);
  }

  // Remaining parameterized routes
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blog post by ID' })
  @ApiResponse({ status: 200, description: 'Return the blog post.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req: any,
  ) {
    return this.blogService.update(id, updateBlogDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.blogService.remove(id, req.user.id);
  }

  // Comment endpoints
  @Post(':id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Add a comment to a blog post' })
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully added.',
  })
  addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    // Always use the authenticated user
    return this.blogService.addComment(id, createCommentDto, req.user.id);
  }

  @Delete(':blogId/comments/:commentId')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Remove a comment from a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The comment has been successfully removed.',
  })
  @ApiResponse({ status: 404, description: 'Blog post or comment not found.' })
  removeComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.blogService.removeComment(blogId, commentId, req.user.id);
  }

  // Like endpoints
  @Post(':id/like')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Like or unlike a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been liked/unliked.',
  })
  likeBlog(@Param('id') id: string, @Request() req: any) {
    return this.blogService.likeBlog(id, req.user.id);
  }

  @Post(':blogId/comments/:commentId/like')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Like or unlike a comment' })
  @ApiResponse({
    status: 200,
    description: 'The comment has been liked/unliked.',
  })
  likeComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.blogService.likeComment(blogId, commentId, req.user.id);
  }

  // Share endpoint
  @Post(':id/share')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
  @ApiOperation({ summary: 'Increment the share count for a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The share count has been incremented.',
  })
  shareBlog(@Param('id') id: string) {
    return this.blogService.shareBlog(id);
  }

  @Post(':id/approve')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('API-Key-auth')
  @UseGuards(AuthGuard(['api-key', 'jwt']), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been approved.',
  })
  approveBlog(@Param('id') id: string) {
    return this.blogService.approveBlog(id);
  }
}
