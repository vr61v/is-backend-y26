import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseDto } from "@/utils/base.dto";
import { DetailCreateDto } from "@/modules/orders/entities/dtos/detail/detail-create.dto";

export class OrderCreateDto extends BaseDto {
  @ApiProperty({ required: true, type: Number, minimum: 1 })
  @IsNotEmpty({ message: "User ID is required" })
  @IsNumber({}, { message: "User ID must be a number" })
  @Min(1, { message: "User ID must be at least 1" })
  userId: number;

  @ApiProperty({ required: true, type: [DetailCreateDto], minItems: 1 })
  @IsNotEmpty({ message: "Details are required" })
  @IsArray({ message: "Details must be an array" })
  @ArrayMinSize(1, { message: "At least one detail item is required" })
  @ValidateNested({ each: true })
  @Type(() => DetailCreateDto)
  details: DetailCreateDto[];
}
