import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { BaseDto } from "@/utils/base.dto";

export class ServiceUpdateDto extends BaseDto {
  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString({ message: "Name value must be a string" })
  nameValue?: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  name?: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;

  @ApiProperty({ required: false, type: Number, minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: "Price must be a number" })
  @IsPositive({ message: "Price must be a positive number" })
  price?: number;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @IsBoolean({ message: "Is rent must be a boolean" })
  isRent?: boolean;
}
