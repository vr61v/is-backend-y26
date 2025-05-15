import { Field, InputType, Int } from "@nestjs/graphql";
import { BaseType } from "@/utils/base.type";

@InputType()
export class ServiceCreateType extends BaseType {
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
}
