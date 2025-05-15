import { Field, GraphQLTimestamp, Int, ObjectType } from "@nestjs/graphql";
import { DetailType } from "../detail/detail.type";
import { BaseType } from "@/utils/base.type";
import { UserType } from "@/modules/users/controllers/graphql/types/user.type";
import { OrderStatus } from "@/modules/orders/enums/order.status.enum";

@ObjectType()
export class OrderType extends BaseType {
  @Field(() => Int)
  id: number;

  @Field(() => UserType)
  user: UserType;

  @Field(() => [DetailType])
  details: DetailType[];

  @Field(() => Int)
  totalPrice: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => GraphQLTimestamp)
  createdAt: Date;
}
