import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "../../services/order.service";
import { NotFoundException } from "@nestjs/common";
import { OrderType } from "./types/order/order.type";
import { GraphqlTransformer } from "@/utils/transformers/GraphqlTransformer";
import { OrderCreateType } from "@/modules/orders/controllers/graphql/types/order/order-create.type";
import { OrderCreateDto } from "@/modules/orders/entities/dtos/order/order-create.dto";
import { OrderErrorMessages } from "@/modules/orders/enums/messages/order-error.messages.enum";
import { OrderUpdateType } from "@/modules/orders/controllers/graphql/types/order/order-update.type";
import { OrderUpdateDto } from "@/modules/orders/entities/dtos/order/order-update.dto";

@Resolver(() => OrderType)
export class OrderResolver {
  private readonly transformer = new GraphqlTransformer();
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => OrderType, { name: "createOrder" })
  async createOrder(@Args("type") type: OrderCreateType) {
    const dto = (await this.transformer.toDto(
      OrderCreateDto,
      type,
    )) as OrderCreateDto;
    const order = await this.orderService.create(dto);
    return this.transformer.toType(OrderType, order) as OrderType;
  }

  @Query(() => OrderType, { name: "getOrderById" })
  async getOrderById(@Args("id", { type: () => Int }) id: number) {
    const order = await this.orderService.getById(id);
    if (!order) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    return this.transformer.toType(OrderType, order) as OrderType;
  }

  @Query(() => [OrderType], { name: "getOrdersByUserId" })
  async getOrdersByUserId(@Args("userId", { type: () => Int }) userId: number) {
    const orders = await this.orderService.getByUserId(userId);
    if (!orders) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    return this.transformer.toType(OrderType, orders) as OrderType;
  }

  @Query(() => [OrderType], { name: "getAllOrders" })
  async getAllOrders() {
    const orders = await this.orderService.getAll();
    if (orders.length == 0) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    return orders.map(
      (order) => this.transformer.toType(OrderType, order) as OrderType,
    );
  }

  @Mutation(() => OrderType, { name: "updateOrder" })
  async updateOrder(
    @Args("id", { type: () => Int }) id: number,
    @Args("type") type: OrderUpdateType,
  ) {
    const dto = (await this.transformer.toDto(
      OrderUpdateDto,
      type,
    )) as OrderUpdateDto;
    const order = await this.orderService.update(id, dto);
    return this.transformer.toType(OrderType, order) as OrderType;
  }

  @Mutation(() => Boolean, { name: "deleteOrder" })
  async deleteOrder(@Args("id", { type: () => Int }) id: number) {
    await this.orderService.delete(id);
    return true;
  }
}
