import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "@/utils/base.dto";

export class DetailCreateDto extends BaseDto {
  @ApiProperty({ required: true, type: Number, minimum: 1 })
  @IsNotEmpty({ message: "Service ID is required" })
  @IsNumber({}, { message: "Service ID must be a number" })
  @Min(1, { message: "Service ID must be at least 1" })
  serviceId: number;

  @ApiProperty({ required: true, type: Number, minimum: 1 })
  @IsNotEmpty({ message: "Quantity is required" })
  @IsNumber({}, { message: "Quantity must be a number" })
  @Min(1, { message: "Quantity must be at least 1" })
  quantity: number;
}
