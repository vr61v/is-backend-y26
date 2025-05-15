import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ServiceType } from "@/modules/services/controllers/graphql/types/service.type";
import { BaseType } from "@/utils/base.type";
import { OrderType } from "@/modules/orders/controllers/graphql/types/order/order.type";

@ObjectType()
export class DetailType extends BaseType {
  @Field(() => Int)
  id: number;

  @Field(() => OrderType)
  order: OrderType;

  @Field(() => ServiceType)
  service: ServiceType;

  @Field(() => Int)
  quantity: number;
}
