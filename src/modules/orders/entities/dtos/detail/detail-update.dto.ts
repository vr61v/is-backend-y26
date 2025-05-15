import { IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "@/utils/base.dto";

export class DetailUpdateDto extends BaseDto {
  @ApiProperty({ required: false, type: Number, minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: "Service ID must be a number" })
  @Min(1, { message: "Service ID must be at least 1" })
  serviceId?: number;

  @ApiProperty({ required: false, type: Number, minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: "Quantity must be a number" })
  @Min(1, { message: "Quantity must be at least 1" })
  quantity?: number;
}
