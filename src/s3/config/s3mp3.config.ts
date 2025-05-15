import { ConfigService } from "@nestjs/config";
import { S3mp3ConfigValidator } from "@/s3/config/validators/s3mp3.config.validator";
import { S3ErrorMessages } from "@/s3/enums/s3-error.messages.enum";

export class S3mp3Config {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  bucket: string;
  maxFileSizeMB: number;

  constructor(configService: ConfigService) {
    const errors = S3mp3ConfigValidator.validate(configService);
    if (errors.length > 0) {
      throw new Error(
        `${S3ErrorMessages.CONFIG_EXCEPTION} errors:${errors.join(", ")}`,
      );
    }

    const endpoint = configService.get<string>("S3_ENDPOINT_URL");
    const accessKey = configService.get<string>("S3_ACCESS_KEY");
    const secretKey = configService.get<string>("S3_SECRET_KEY");
    const region = configService.get<string>("S3_REGION");
    const bucket = configService.get<string>("S3_BUCKET_NAME");
    const maxFileSizeMB = configService.get<number>("S3_MAX_MP3_SIZE");

    if (
      !endpoint ||
      !accessKey ||
      !secretKey ||
      !region ||
      !bucket ||
      !maxFileSizeMB
    ) {
      throw new Error(S3ErrorMessages.CONFIG_EXCEPTION);
    }

    this.endpoint = endpoint;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.region = region;
    this.bucket = bucket;
    this.maxFileSizeMB = maxFileSizeMB;
  }
}
