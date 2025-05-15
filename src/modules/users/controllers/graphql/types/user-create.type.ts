import { InputType, Field } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";

@InputType()
export class UserCreateType extends BaseType {
  @Field(() => String, { nullable: false })
  fullName: string;

  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => String, { nullable: false })
  password: string;
}
