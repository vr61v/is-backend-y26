import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { BaseDto } from "@/utils/base.dto";

export class UserCreateDto extends BaseDto {
  @ApiProperty({ required: true, type: String, minLength: 1 })
  @IsNotEmpty({ message: "Full name is null" })
  @IsString({ message: "Full name must be a string" })
  fullName: string;

  @IsNotEmpty({ message: "Id is null" })
  supertokensId: string;

  @ApiProperty({ required: true, type: String, format: "email" })
  @IsNotEmpty({ message: "Email is null" })
  @IsEmail({}, { message: "Email is invalid" })
  email: string;

  @ApiProperty({ required: true, type: String, minLength: 6 })
  @IsNotEmpty({ message: "Password is null" })
  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;
}
