import { Field, InputType, Int } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";

@InputType()
export class ServiceUpdateType extends BaseType {
  @Field(() => String, { nullable: true })
  nameValue?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  price?: number;

  @Field(() => Boolean, { nullable: true })
  isRent?: boolean;
}
