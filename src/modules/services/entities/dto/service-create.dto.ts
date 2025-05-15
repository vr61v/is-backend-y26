import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";
import { BaseDto } from "@/utils/base.dto";

export class ServiceCreateDto extends BaseDto {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty({ message: "Name value is null" })
  @IsString({ message: "Name value must be a string" })
  nameValue: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty({ message: "Name is null" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty({ message: "Description is null" })
  @IsString({ message: "Description must be a string" })
  description: string;

  @ApiProperty({ required: true, type: Number, minimum: 1 })
  @IsNotEmpty({ message: "Price is null" })
  @IsNumber({}, { message: "Price must be a number" })
  @IsPositive({ message: "Price must be a positive number" })
  price: number;

  @ApiProperty({ required: true, type: Boolean })
  @IsNotEmpty({ message: "Is rent is null" })
  @IsBoolean({ message: "Is rent must be a boolean" })
  isRent: boolean;
}
