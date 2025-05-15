import { ConfigService } from "@nestjs/config";

export class S3mp3ConfigValidator {
  public static validate(configService: ConfigService): string[] {
    const errors: string[] = [];
    if (!configService.get<string>("S3_ENDPOINT_URL")) {
      errors.push("S3_ENDPOINT is required or invalid endpoint");
    }
    if (!configService.get<string>("S3_ACCESS_KEY")) {
      errors.push("S3_ACCESS_KEY is required or invalid access key");
    }
    if (!configService.get<string>("S3_SECRET_KEY")) {
      errors.push("S3_SECRET_KEY is required or invalid secret");
    }
    if (!configService.get<string>("S3_REGION")) {
      errors.push("AWS_REGION is required or invalid region");
    }
    if (!configService.get<string>("S3_BUCKET_NAME")) {
      errors.push("S3_BUCKET_NAME is required or invalid bucket");
    }
    if (!configService.get<number>("S3_MAX_MP3_SIZE")) {
      errors.push("S3_MAX_FILE_SIZE is required or invalid maxFileSize");
    }

    return errors;
  }
}
