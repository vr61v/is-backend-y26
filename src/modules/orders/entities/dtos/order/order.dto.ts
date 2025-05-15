import { ApiProperty } from "@nestjs/swagger";
import { DetailDto } from "../detail/detail.dto";
import { Expose, Transform, Type } from "class-transformer";
import { BaseDto } from "@/utils/base.dto";
import { OrderStatus } from "@/modules/orders/enums/order.status.enum";
import { Order } from "@/modules/orders/entities/order.entity";

export class OrderDto extends BaseDto {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number })
  @Transform(({ obj }) => {
    if (obj != null && obj instanceof Order) {
      return obj.user?.id;
    } else {
      return undefined;
    }
  })
  @Expose()
  userId: number;

  @ApiProperty({ type: [DetailDto] })
  @Type(() => DetailDto)
  @Expose()
  details: DetailDto[];

  @ApiProperty({ type: Number })
  @Expose()
  totalPrice: number;

  @ApiProperty({ enum: OrderStatus })
  @Expose()
  status: OrderStatus;

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;
}
