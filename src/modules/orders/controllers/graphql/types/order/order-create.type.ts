import { Field, InputType, Int } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";
import { DetailUpdateType } from "@/modules/orders/controllers/graphql/types/detail/detail-update.type";

@InputType()
export class OrderCreateType extends BaseType {
  @Field(() => Int)
  userId: number;

  @Field(() => [DetailUpdateType])
  details: DetailUpdateType[];
}
