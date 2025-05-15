import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { OrderService } from "../../services/order.service";
import { OrderDto } from "@/modules/orders/entities/dtos/order/order.dto";
import { plainToInstance } from "class-transformer";
import { Order } from "../../entities/order.entity";
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
import { TimeInterceptor } from "@/utils/interceptors/TimeInterceptor";
import { ETagInterceptor } from "@/utils/interceptors/ETagInterceptor";
import { OrderCreateDto } from "@/modules/orders/entities/dtos/order/order-create.dto";
import { OrderErrorMessages } from "@/modules/orders/enums/messages/order-error.messages.enum";
import { OrderUpdateDto } from "@/modules/orders/entities/dtos/order/order-update.dto";
import { Roles } from "@/auth/decorator/roles";
import { RolesGuard } from "@/auth/guard/roles.guard";

@ApiTags("Orders controller")
@Controller("api/orders")
@UseInterceptors(TimeInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBody({ type: OrderCreateDto })
  @ApiCreatedResponse({ type: OrderDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["user", "admin"])
  @UseGuards(RolesGuard)
  async create(@Body() dto: OrderCreateDto): Promise<OrderDto> {
    const order = await this.orderService.create(dto);
    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse({ type: OrderDto })
  @ApiNotFoundResponse()
  @UseInterceptors(ETagInterceptor<OrderDto>)
  @Header("Cache-Control", "no-cache, max-age=600")
  @Roles(["user", "admin"])
  @UseGuards(RolesGuard)
  async getById(@Param("id", ParseIntPipe) id: number): Promise<OrderDto> {
    const order = await this.orderService.getById(id);
    if (!order) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Get("user/:id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse({ type: [OrderDto] })
  @ApiNotFoundResponse()
  @UseInterceptors(ETagInterceptor<OrderDto[]>)
  @Header("Cache-Control", "no-cache, max-age=600")
  @Roles(["user", "admin"])
  @UseGuards(RolesGuard)
  async getByUserId(
    @Param("id", ParseIntPipe) userId: number,
  ): Promise<OrderDto[]> {
    const orders: Order[] = await this.orderService.getByUserId(userId);
    if (orders.length == 0) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    return plainToInstance(OrderDto, orders, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOkResponse({ type: [OrderDto] })
  @ApiNotFoundResponse()
  @UseInterceptors(ETagInterceptor<OrderDto[]>)
  @Header("Cache-Control", "public, max-age=600")
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async getAll(): Promise<OrderDto[]> {
    const orders: Order[] = await this.orderService.getAll();
    if (orders.length == 0) {
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    return plainToInstance(OrderDto, orders, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiBody({ type: OrderUpdateDto })
  @ApiOkResponse({ type: OrderDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: OrderUpdateDto,
  ): Promise<OrderDto> {
    const order = await this.orderService.update(id, dto);
    return plainToInstance(OrderDto, order, {
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
    return await this.orderService.delete(id);
  }
}
