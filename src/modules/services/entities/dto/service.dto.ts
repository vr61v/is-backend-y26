import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BaseDto } from "@/utils/base.dto";

export class ServiceDto extends BaseDto {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  nameValue: string;

  @ApiProperty({ type: String })
  @Expose()
  name: string;

  @ApiProperty({ type: String })
  @Expose()
  description: string;

  @ApiProperty({ type: Number })
  @Expose()
  price: number;

  @ApiProperty({ type: Boolean })
  @Expose()
  isRent: boolean;
}
