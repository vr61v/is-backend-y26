import { Field, InputType } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";
import { DetailUpdateType } from "@/modules/orders/controllers/graphql/types/detail/detail-update.type";
import { OrderStatus } from "@/modules/orders/enums/order.status.enum";

@InputType()
export class OrderUpdateType extends BaseType {
  @Field(() => [DetailUpdateType], { nullable: true })
  details?: DetailUpdateType[];

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
}
