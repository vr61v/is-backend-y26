import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "@/modules/users/enums/user.status.enum";
import { Expose } from "class-transformer";
import { BaseDto } from "@/utils/base.dto";

export class UserDto extends BaseDto {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @Expose()
  supertokensId: string;

  @ApiProperty({ type: String })
  @Expose()
  fullName: string;

  @ApiProperty({ type: String, format: "email" })
  @Expose()
  email: string;

  @ApiProperty({ type: String })
  @Expose()
  password: string;

  @ApiProperty({ enum: UserStatus, type: String })
  @Expose()
  status: UserStatus;

  @ApiProperty({ type: Date })
  @Expose()
  createdAt: Date;
}
