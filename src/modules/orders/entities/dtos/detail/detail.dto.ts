import { Expose, Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "@/utils/base.dto";
import { ServiceDto } from "@/modules/services/entities/dto/service.dto";
import { Detail } from "@/modules/orders/entities/detail.entity";

export class DetailDto extends BaseDto {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: Number })
  @Transform(({ obj }) => {
    if (obj != null && obj instanceof Detail) {
      return obj.order?.id;
    } else {
      return undefined;
    }
  })
  @Expose()
  orderId: number;

  @ApiProperty({ type: ServiceDto })
  @Type(() => ServiceDto)
  @Expose()
  service: ServiceDto;

  @ApiProperty({ type: Number })
  @Expose()
  quantity: number;
}
