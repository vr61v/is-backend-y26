import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  paginateListObjectsV2,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { S3mp3Config } from "@/s3/config/s3mp3.config";
import { S3ErrorMessages } from "@/s3/enums/s3-error.messages.enum";
import { Readable } from "stream";

@Injectable()
export class S3mp3Service {
  private readonly s3: AWS.S3;
  private readonly config: S3mp3Config;
  private readonly logger = new Logger(S3mp3Service.name);
  private readonly FILES_DIRECTORY = "audio";

  constructor(configService: ConfigService) {
    this.config = new S3mp3Config(configService);

    this.s3 = new AWS.S3({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
    });
  }

  private createFileKey(orderId: number, filename: string): string {
    const cleanedFilename = filename
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-_.]/g, "");
    return `${orderId}/${this.FILES_DIRECTORY}/${cleanedFilename}`;
  }

  private createFileUrl(key: string): string {
    return `${this.config.endpoint}/${this.config.bucket}/${key}`;
  }

  async upload(orderId: number, file: Express.Multer.File) {
    const key = this.createFileKey(orderId, file.originalname);
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: file.buffer,
    });
    try {
      await this.s3.send(command);
      return this.createFileUrl(key);
    } catch (error) {
      this.logger.error(
        `${S3ErrorMessages.UPLOAD_ERROR} orderID: ${orderId}: ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async download(orderId: number, filename: string) {
    const key = this.createFileKey(orderId, filename);
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    try {
      const response = await this.s3.send(command);
      if (!response.Body) {
        this.logger.error(`${S3ErrorMessages.FILE_NOT_FOUND} key: ${key}`);
        throw new NotFoundException(S3ErrorMessages.FILE_NOT_FOUND);
      }
      return response.Body as Readable;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `${S3ErrorMessages.DOWNLOAD_ERROR} key: ${key}: ${error}`,
      );
      throw new InternalServerErrorException(S3ErrorMessages.DOWNLOAD_ERROR);
    }
  }

  async head(orderId: number, filename: string) {
    const key = this.createFileKey(orderId, filename);
    const command = new HeadObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return await this.s3.send(command);
  }

  async listAll(orderId: number) {
    const prefix = `${orderId}/${this.FILES_DIRECTORY}`;
    const paginator = paginateListObjectsV2(
      { client: this.s3 },
      { Bucket: this.config.bucket, Prefix: prefix },
    );

    const keys: string[] = [];
    for await (const page of paginator) {
      const objects = page.Contents;
      if (!objects) continue;
      for (const object of objects) {
        if (!object.Key) continue;
        keys.push(object.Key);
      }
    }

    return keys;
  }

  async delete(orderId: number, filename: string) {
    const key = this.createFileKey(orderId, filename);
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    try {
      await this.s3.send(command);
    } catch (error) {
      this.logger.error(
        `${S3ErrorMessages.DELETE_ERROR} key: ${key}: ${error}`,
      );
      throw new InternalServerErrorException(S3ErrorMessages.DELETE_ERROR);
    }

    return true;
  }
}
