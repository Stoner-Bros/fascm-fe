import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument, Comment } from './schema/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '@api/notifications/notifications.service';
import { NotificationType } from '@api/notifications/dto/create-notification.dto';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {
    const newBlog = new this.blogModel({
      ...createBlogDto,
      author: new Types.ObjectId(userId),
    });
    const savedBlog = await newBlog.save();
    await this.notificationService.create(userId, {
      type: NotificationType.INFO,
      category: 'blog',
      title: 'blogCreated',
      message: 'blogCreatedMessage',
      data: {
        blogId: savedBlog._id.toString(),
      },
    });
    return this.findOne(savedBlog._id.toString());
  }

  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<Blog>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [blogs, total] = await Promise.all([
      this.blogModel
        .find({ isActive: true })
        .sort(sortOptions as any)
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName avatar email')
        .populate('likedBy', 'firstName lastName avatar email')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'firstName lastName avatar email',
          },
        })
        .populate({
          path: 'comments',
          populate: {
            path: 'likedBy',
            select: 'firstName lastName avatar email',
          },
        })
        .exec(),
      this.blogModel.countDocuments({ isActive: true }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<BlogDocument> {
    const blog = await this.blogModel
      .findById(id)
      .populate('author', 'firstName lastName avatar email')
      .populate('likedBy', 'firstName lastName avatar email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName avatar email',
        },
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'likedBy',
          select: 'firstName lastName avatar email',
        },
      })
      .exec();

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    userId?: string,
  ): Promise<Blog> {
    const blog = await this.findOne(id);

    // Optional: Check if the user is the author of the blog post
    if (userId && (blog.author as any)._id.toString() !== userId) {
      throw new NotFoundException(
        'You are not authorized to update this blog post',
      );
    }

    const updatedBlog = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, { new: true })
      .exec();

    if (!updatedBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    updatedBlog.isActive = false;
    await updatedBlog.save();

    await this.notificationService.create(userId || '', {
      type: NotificationType.INFO,
      category: 'blog',
      title: 'blogUpdated',
      message: 'blogUpdatedMessage',
      data: {
        blogId: updatedBlog._id.toString(),
      },
    });

    return this.findOne(id);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const blog = await this.findOne(id);

    // Optional: Check if the user is the author of the blog post
    if (userId && (blog.author as any)._id.toString() !== userId) {
      throw new NotFoundException(
        'You are not authorized to delete this blog post',
      );
    }

    const result = await this.blogModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    await this.notificationService.create(userId || '', {
      type: NotificationType.ERROR,
      category: 'blog',
      title: 'blogDeleted',
      message: 'blogDeletedMessage',
      data: {
        blogId: blog._id.toString(),
      },
    });
  }

  // Comment-related methods
  async addComment(
    blogId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Blog> {
    const blog = await this.findOne(blogId);

    blog.comments.push({
      author: new Types.ObjectId(userId) as any,
      content: createCommentDto.content,
      likes: 0,
      likedBy: [],
    } as Comment);

    await blog.save();

    await this.notificationService.create(blog.author as any, {
      type: NotificationType.INFO,
      category: 'blog',
      title: 'blogCommented',
      message: 'blogCommentedMessage',
      data: {
        blogId: blog._id.toString(),
      },
    });

    return this.findOne(blogId);
  }

  async removeComment(
    blogId: string,
    commentId: string,
    userId?: string,
  ): Promise<Blog> {
    const blog = await this.findOne(blogId);

    const comment = blog.comments.find(
      (c: any) => c._id.toString() === commentId,
    );

    // Optional: Check if the user is the author of the comment
    if (
      userId &&
      comment &&
      (comment.author as any)._id.toString() !== userId
    ) {
      throw new NotFoundException(
        'You are not authorized to delete this comment',
      );
    }

    blog.comments = blog.comments.filter(
      (comment: any) => comment._id.toString() !== commentId,
    );

    await blog.save();
    return this.findOne(blogId);
  }

  // Like-related methods
  async likeBlog(blogId: string, userId: string): Promise<Blog> {
    const blog = await this.findOne(blogId);

    // Find if user has already liked this blog
    const userLikedIndex = blog.likedBy.findIndex(
      (user: any) => user._id.toString() === userId,
    );

    if (userLikedIndex === -1) {
      // User hasn't liked yet, add the like
      blog.likedBy.push(new Types.ObjectId(userId) as any);
      blog.likesCount += 1;
    } else {
      // User already liked, remove the like (unlike)
      blog.likedBy.splice(userLikedIndex, 1);
      blog.likesCount -= 1;
    }

    await blog.save();

    await this.notificationService.create(blog.author as any, {
      type: NotificationType.INFO,
      category: 'blog',
      title: 'blogLiked',
      message: 'blogLikedMessage',
      data: {
        blogId: blog._id.toString(),
      },
    });

    return this.findOne(blogId);
  }

  async likeComment(
    blogId: string,
    commentId: string,
    userId: string,
  ): Promise<Blog> {
    const blog = await this.findOne(blogId);

    const comment = blog.comments.find(
      (c: any) => c._id.toString() === commentId,
    );

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Find if user has already liked this comment
    const userLikedIndex = comment.likedBy.findIndex(
      (user: any) => user._id.toString() === userId,
    );

    if (userLikedIndex === -1) {
      // User hasn't liked yet, add the like
      comment.likedBy.push(new Types.ObjectId(userId) as any);
      comment.likes += 1;
    } else {
      // User already liked, remove the like (unlike)
      comment.likedBy.splice(userLikedIndex, 1);
      comment.likes -= 1;
    }

    await blog.save();

    await this.notificationService.create(comment.author as any, {
      type: NotificationType.INFO,
      category: 'blog',
      title: 'blogCommentLiked',
      message: 'blogCommentLikedMessage',
      data: {
        blogId: blog._id.toString(),
      },
    });

    return this.findOne(blogId);
  }

  // Share-related methods
  async shareBlog(
    blogId: string,
  ): Promise<{ message: string; shareUrl: string }> {
    const blog = await this.findOne(blogId);
    blog.sharesCount += 1;
    await blog.save();
    return {
      message: 'Blog shared successfully',
      shareUrl: `https://example.com/blog/${blogId}`,
    };
  }

  async getMyBlogs(
    userId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Blog>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [blogs, total] = await Promise.all([
      this.blogModel
        .find({ author: userId })
        .sort(sortOptions as any)
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName avatar email')
        .populate('likedBy', 'firstName lastName avatar email')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'firstName lastName avatar email',
          },
        })
        .populate({
          path: 'comments',
          populate: {
            path: 'likedBy',
            select: 'firstName lastName avatar email',
          },
        })
        .exec(),
      this.blogModel.countDocuments({ author: userId }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async approveBlog(blogId: string): Promise<Blog> {
    const blog = await this.findOne(blogId);
    blog.isActive = true;
    await blog.save();
    await this.notificationService.create(blog.author as any, {
      type: NotificationType.SUCCESS,
      category: 'blog',
      title: 'blogApproved',
      message: 'blogApprovedMessage',
      data: {
        blogId: blog._id.toString(),
      },
    });
    return this.findOne(blogId);
  }
}
