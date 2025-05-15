import { Field, InputType } from "@nestjs/graphql";
import { UserStatus } from "@/modules/users/enums/user.status.enum";
import { BaseType } from "@/utils/base.type";

@InputType()
export class UserUpdateType extends BaseType {
  @Field(() => String, { nullable: true })
  fullName?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;
}
