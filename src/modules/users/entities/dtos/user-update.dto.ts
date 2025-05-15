import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserStatus } from "@/modules/users/enums/user.status.enum";
import { BaseDto } from "@/utils/base.dto";

export class UserUpdateDto extends BaseDto {
  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString({ message: "Full name must be a string" })
  fullName?: string;

  @ApiProperty({ required: false, type: String, format: "email" })
  @IsOptional()
  @IsEmail({}, { message: "Email is invalid" })
  email?: string;

  @ApiProperty({ required: false, type: String, minLength: 6 })
  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password?: string;

  @ApiProperty({ required: false, enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus, {
    message: `Status must be one of: ${Object.values(UserStatus).join(", ")}`,
  })
  status?: UserStatus;
}
