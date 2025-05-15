import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { DetailService } from "../../services/detail.service";
import { DetailDto } from "@/modules/orders/entities/dtos/detail/detail.dto";
import { plainToInstance } from "class-transformer";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { OrderService } from "../../services/order.service";
import { TimeInterceptor } from "@/utils/interceptors/TimeInterceptor";
import { DetailCreateDto } from "@/modules/orders/entities/dtos/detail/detail-create.dto";
import { OrderErrorMessages } from "@/modules/orders/enums/messages/order-error.messages.enum";
import { DetailErrorMessages } from "@/modules/orders/enums/messages/detail-error.messages.enum";
import { DetailUpdateDto } from "@/modules/orders/entities/dtos/detail/detail-update.dto";
import { Roles } from "@/auth/decorator/roles";
import { RolesGuard } from "@/auth/guard/roles.guard";

@ApiTags("Details controller")
@Controller("api/details")
@UseInterceptors(TimeInterceptor)
export class DetailController {
  constructor(
    private readonly detailService: DetailService,
    private readonly orderService: OrderService,
  ) {}

  @Post(":orderId")
  @ApiParam({ name: "orderId", required: true, type: Number })
  @ApiBody({ type: DetailCreateDto })
  @ApiCreatedResponse({ type: DetailDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async create(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body() dto: DetailCreateDto,
  ): Promise<DetailDto> {
    const order = await this.orderService.getById(orderId);
    if (!order) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    const detail = await this.detailService.create(order, dto);
    await this.orderService.updatePrice(
      orderId,
      order.totalPrice + detail.service.price * detail.quantity,
    );

    return plainToInstance(DetailDto, detail, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse({ type: DetailDto })
  @ApiNotFoundResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async getById(@Param("id", ParseIntPipe) id: number): Promise<DetailDto> {
    const detail = await this.detailService.getById(id);
    if (!detail) {
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    return plainToInstance(DetailDto, detail, {
      excludeExtraneousValues: true,
    });
  }

  @Get("order/:orderId")
  @ApiParam({ name: "orderId", required: true, type: Number })
  @ApiOkResponse({ type: [DetailDto] })
  @ApiNotFoundResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async getByOrderId(
    @Param("orderId", ParseIntPipe) orderId: number,
  ): Promise<DetailDto[]> {
    const details = await this.detailService.getByOrderId(orderId);
    if (details.length === 0) {
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    return plainToInstance(DetailDto, details, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOkResponse({ type: [DetailDto] })
  @ApiNotFoundResponse()
  async getAll(): Promise<DetailDto[]> {
    const details = await this.detailService.getAll();
    if (details.length === 0) {
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    return plainToInstance(DetailDto, details, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiBody({ type: DetailUpdateDto })
  @ApiOkResponse({ type: DetailDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: DetailUpdateDto,
  ): Promise<DetailDto> {
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

    return plainToInstance(DetailDto, updatedDetail, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse({ type: Promise<boolean> })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async delete(@Param("id", ParseIntPipe) id: number): Promise<boolean> {
    return await this.detailService.delete(id);
  }

  @Delete("order/:orderId")
  @ApiParam({ name: "orderId", required: true, type: Number })
  @ApiOkResponse({ type: Promise<boolean> })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async deleteByOrderId(
    @Param("orderId", ParseIntPipe) orderId: number,
  ): Promise<boolean> {
    return await this.detailService.deleteByOrderId(orderId);
  }
}
