import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  StreamableFile,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { FindFilesQueryDto, FileResponseDto } from './dto/file.dto';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { FilesService } from './files.service';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';
import { User } from '@api/auth/decorators/user.decorator';
import { UserDocument } from '@api/users/schema/user.schema';

@ApiTags('files')
@Controller('files')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The file has been uploaded successfully',
    type: FileResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserDocument,
  ) {
    return this.filesService.create(file, user.id);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The files have been uploaded successfully',
    type: [FileResponseDto],
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @User() user: UserDocument,
  ) {
    return this.filesService.createMany(files, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiQuery({ type: FindFilesQueryDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of files',
    type: [FileResponseDto],
  })
  async findAll(@Query() query: FindFilesQueryDto) {
    return this.filesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by id' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File details',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.filesService.findOne(id);

    if (!fs.existsSync(file.path)) {
      throw new NotFoundException('File not found on server');
    }

    const fileStream = fs.createReadStream(file.path);
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });

    return new StreamableFile(fileStream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async remove(@Param('id') id: string) {
    await this.filesService.delete(id);
    return { message: 'File deleted successfully' };
  }
}
