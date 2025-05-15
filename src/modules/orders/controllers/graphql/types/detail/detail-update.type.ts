import { Field, Int, InputType } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";

@InputType()
export class DetailUpdateType extends BaseType {
  @Field(() => Int, { nullable: true })
  serviceId?: number;

  @Field(() => Int, { nullable: true })
  quantity?: number;
}
