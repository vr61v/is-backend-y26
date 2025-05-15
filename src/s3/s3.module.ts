import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3mp3Service } from "./services/s3mp3.service";
import { S3MP3Controller } from "./controllers/s3mp3.controller";

@Module({
  controllers: [S3MP3Controller],
  imports: [ConfigModule],
  providers: [S3mp3Service],
  exports: [S3mp3Service],
})
export class S3Module {}
