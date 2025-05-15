import { Field, Int, ObjectType } from "@nestjs/graphql";
import { DetailType } from "@/modules/orders/controllers/graphql/types/detail/detail.type";
import { BaseType } from "@/utils/base.type";

@ObjectType()
export class ServiceType extends BaseType {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  nameValue: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => Int)
  price: number;

  @Field(() => Boolean)
  isRent: boolean;

  @Field(() => [DetailType], { nullable: true })
  details?: DetailType[];
}
