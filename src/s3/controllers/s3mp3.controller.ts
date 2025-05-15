import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3mp3Service } from "@/s3/services/s3mp3.service";
import { Express, Response } from "express";

@Controller("orders/:orderId/audio")
export class S3MP3Controller {
  constructor(private readonly s3MP3Service: S3mp3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @Param("orderId", ParseIntPipe) orderId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.s3MP3Service.upload(orderId, file);
  }

  @Get(":filename")
  async downloadFile(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    const stream = await this.s3MP3Service.download(orderId, filename);
    const metadata = await this.s3MP3Service.head(orderId, filename);
    res.set({
      "Content-Type": metadata.ContentType || "audio/mpeg",
      "Content-Length": metadata.ContentLength?.toString(),
      "Accept-Ranges": "bytes",
    });

    stream.pipe(res);
  }

  @Get()
  async listAllFiles(@Param("orderId") orderId: number) {
    return await this.s3MP3Service.listAll(orderId);
  }

  @Delete(":filename")
  async deleteFile(
    @Param("orderId") orderId: number,
    @Param("filename") filename: string,
  ) {
    return await this.s3MP3Service.delete(orderId, filename);
  }
}
