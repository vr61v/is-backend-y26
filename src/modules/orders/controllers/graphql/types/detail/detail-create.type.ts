import { Field, Int, InputType } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";

@InputType()
export class DetailCreateType extends BaseType {
  @Field(() => Int)
  serviceId: number;

  @Field(() => Int)
  quantity: number;
}
