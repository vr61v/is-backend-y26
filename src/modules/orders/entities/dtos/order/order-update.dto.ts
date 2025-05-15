import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseDto } from "@/utils/base.dto";
import { DetailCreateDto } from "@/modules/orders/entities/dtos/detail/detail-create.dto";
import { OrderStatus } from "@/modules/orders/enums/order.status.enum";

export class OrderUpdateDto extends BaseDto {
  @ApiProperty({ required: false, type: [DetailCreateDto], minItems: 1 })
  @IsOptional()
  @IsArray({ message: "Details must be array" })
  @ArrayMinSize(1, { message: "Details length must be at least 1" })
  @ValidateNested({ each: true })
  @Type(() => DetailCreateDto)
  details?: DetailCreateDto[];

  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `Status must be one of: ${Object.values(OrderStatus).join(", ")}`,
  })
  status?: OrderStatus;
}
