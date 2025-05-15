import { Field, ID, ObjectType } from "@nestjs/graphql";
import { OrderType } from "@/modules/orders/controllers/graphql/types/order/order.type";
import { BaseType } from "@/utils/base.type";
import { UserStatus } from "@/modules/users/enums/user.status.enum";

@ObjectType()
export class UserType extends BaseType {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  fullName: string;

  @Field(() => String)
  email: string;

  @Field(() => [OrderType], { nullable: true })
  orders?: OrderType[];

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => Date)
  createdAt: Date;
}
