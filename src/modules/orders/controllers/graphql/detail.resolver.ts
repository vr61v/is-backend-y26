import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NotFoundException } from "@nestjs/common";
import { DetailType } from "./types/detail/detail.type";
import { DetailService } from "../../services/detail.service";
import { OrderService } from "../../services/order.service";
import { GraphqlTransformer } from "@/utils/transformers/GraphqlTransformer";
import { DetailCreateType } from "@/modules/orders/controllers/graphql/types/detail/detail-create.type";
import { DetailCreateDto } from "@/modules/orders/entities/dtos/detail/detail-create.dto";
import { DetailUpdateDto } from "@/modules/orders/entities/dtos/detail/detail-update.dto";
import { DetailUpdateType } from "@/modules/orders/controllers/graphql/types/detail/detail-update.type";
import { OrderErrorMessages } from "@/modules/orders/enums/messages/order-error.messages.enum";
import { DetailErrorMessages } from "@/modules/orders/enums/messages/detail-error.messages.enum";

@Resolver(() => DetailType)
export class DetailResolver {
  private readonly transformer = new GraphqlTransformer();
  constructor(
    private readonly detailService: DetailService,
    private readonly orderService: OrderService,
  ) {}

  @Mutation(() => DetailType, { name: "createDetail" })
  async createDetail(
    @Args("orderId", { type: () => Int }) orderId: number,
    @Args("type") type: DetailCreateType,
  ) {
    const dto = (await this.transformer.toDto(
      DetailCreateDto,
      type,
    )) as DetailCreateDto;
    const order = await this.orderService.getById(orderId);
    if (!order) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    const detail = await this.detailService.create(order, dto);
    await this.orderService.updatePrice(
      orderId,
      order.totalPrice + detail.service.price * detail.quantity,
    );

    return this.transformer.toType(DetailType, detail) as DetailType;
  }

  @Query(() => DetailType, { name: "getDetailById" })
  async getDetailById(@Args("id", { type: () => Int }) id: number) {
    const detail = await this.detailService.getById(id);
    if (!detail) throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    return this.transformer.toType(DetailType, detail) as DetailType;
  }

  @Query(() => [DetailType], { name: "getAllDetails" })
  async getAllDetails() {
    const details = await this.detailService.getAll();
    if (details.length == 0) {
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    return details.map(
      (detail) => this.transformer.toType(DetailType, detail) as DetailType,
    );
  }

  @Query(() => [DetailType], { name: "getDetailByOrderId" })
  async getDetailByOrderId(
    @Args("orderId", { type: () => Int }) orderId: number,
  ) {
    const details = await this.detailService.getByOrderId(orderId);
    if (details.length == 0) {
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    return details.map(
      (detail) => this.transformer.toType(DetailType, detail) as DetailType,
    );
  }

  @Mutation(() => DetailType, { name: "updateDetail" })
  async updateDetail(
    @Args("id", { type: () => Int }) id: number,
    @Args("type") type: DetailUpdateType,
  ) {
    const dto = (await this.transformer.toDto(
      DetailUpdateDto,
      type,
    )) as DetailUpdateDto;
    const order = await this.orderService.getByDetailId(id);
    if (!order) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    const oldDetail = order.details.find((detail) => detail.id === id);
    if (!oldDetail) {
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    const updatedDetail = await this.detailService.update(id, dto);
    const newTotalPrice =
      order.totalPrice -
      oldDetail.quantity * oldDetail.service.price +
      updatedDetail.quantity * updatedDetail.service.price;
    if (order.totalPrice != newTotalPrice) {
      updatedDetail.order = await this.orderService.updatePrice(
        order.id,
        newTotalPrice,
      );
    }

    return this.transformer.toType(DetailType, updatedDetail) as DetailType;
  }

  @Mutation(() => Boolean, { name: "deleteDetail" })
  async deleteDetail(@Args("id", { type: () => Int }) id: number) {
    await this.detailService.delete(id);
    return true;
  }
}
