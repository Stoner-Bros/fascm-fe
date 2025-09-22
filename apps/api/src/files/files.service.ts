import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { FindFilesQueryDto } from './dto/file.dto';
import { File } from './schema/file.schema';
import { validateObjectId } from '@api/common/utils/mongoose.utils';
import { CustomNotFoundException } from '@api/common';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    private configService: ConfigService,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(file: Express.Multer.File, owner?: string): Promise<File> {
    const createdFile = new this.fileModel({
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      owner: owner,
    });
    return createdFile.save();
  }

  async createWithOpenAIFileId(
    file: Express.Multer.File,
    openaiFileId: string,
    owner?: string,
  ): Promise<File> {
    const createdFile = new this.fileModel({
      openaiFileId,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      owner: owner,
    });
    return createdFile.save();
  }

  async updateFileWithMessage(
    fileId: string,
    messageId: string,
  ): Promise<File> {
    validateObjectId(fileId, 'file');
    validateObjectId(messageId, 'message');

    const file = await this.fileModel
      .findByIdAndUpdate(fileId, { message: messageId }, { new: true })
      .exec();

    if (!file) {
      throw new CustomNotFoundException(
        `File with ID ${fileId} not found`,
        'fileNotFound',
      );
    }

    return file;
  }

  async createMany(
    files: Express.Multer.File[],
    owner?: string,
  ): Promise<File[]> {
    const createdFiles = await Promise.all(
      files.map((file) => {
        const newFile = new this.fileModel({
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          owner: owner,
        });
        return newFile.save();
      }),
    );
    return createdFiles;
  }

  async findAll(query: FindFilesQueryDto = {}): Promise<File[]> {
    const filter: any = {};

    if (query.filename) {
      filter.filename = { $regex: query.filename, $options: 'i' };
    }

    if (query.mimetype) {
      filter.mimetype = { $regex: query.mimetype, $options: 'i' };
    }

    return this.fileModel.find(filter).exec();
  }

  async findOne(id: string): Promise<File> {
    validateObjectId(id, 'file');
    const file = await this.fileModel.findById(id).exec();
    if (!file) {
      throw new CustomNotFoundException(
        `File with ID ${id} not found`,
        'fileNotFound',
      );
    }
    return file;
  }

  async delete(id: string): Promise<void> {
    const file = await this.findOne(id);

    // Delete the file from the filesystem if it exists
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await this.fileModel.findByIdAndDelete(id).exec();
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
}
