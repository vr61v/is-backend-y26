import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { UserService } from "@/modules/users/services/user.service";
import { DetailService } from "./detail.service";
import { Detail } from "../entities/detail.entity";
import { OrderCreateDto } from "@/modules/orders/entities/dtos/order/order-create.dto";
import { UserErrorMessages } from "@/modules/users/enums/user-error.messages.enum";
import { OrderErrorMessages } from "@/modules/orders/enums/messages/order-error.messages.enum";
import { OrderUpdateDto } from "@/modules/orders/entities/dtos/order/order-update.dto";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UserService,
    private readonly detailService: DetailService,
  ) {}

  /**
   * Calculates total price from order details
   * @param {Detail} details - Array of order details
   * @returns {number} - Calculated total price
   */
  private calculateTotalPrice(details: Detail[]): number {
    return details.reduce((sum, detail) => {
      const servicePrice = detail.service?.price ?? 0;
      const quantity = detail.quantity ?? 0;
      return sum + servicePrice * quantity;
    }, 0);
  }

  /**
   * Creates a new order with details
   * @param {OrderCreateDto} dto - DTO with order data
   * @returns {Promise<Order>} - Created order with calculated total price
   * @throws {NotFoundException} - If user not found
   * @throws {InternalServerErrorException} - If creation fails
   */
  public async create(dto: OrderCreateDto): Promise<Order> {
    const user = await this.userService.getById(dto.userId);
    if (!user) {
      this.logger.error(`${UserErrorMessages.NOT_FOUND} ID: ${dto.userId}`);
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    try {
      const order = this.orderRepository.create({ user });
      await this.orderRepository.save(order);

      const details = await this.detailService.createMany(order, dto.details);
      const totalPrice = this.calculateTotalPrice(details);

      order.details = details;
      order.totalPrice = totalPrice;
      return await this.orderRepository.save(order);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`${OrderErrorMessages.CREATE_ERROR}: ${error}`);
      throw new InternalServerErrorException(OrderErrorMessages.CREATE_ERROR);
    }
  }

  /**
   * Gets order by ID with relations
   * @param {number} id - Order ID
   * @returns {Promise<Order | null>} - Order or null if not found
   */
  public async getById(id: number): Promise<Order | null> {
    return await this.orderRepository.findOne({
      relations: ["user", "details", "details.service"],
      where: { id },
    });
  }

  /**
   * Gets order by detail ID
   * @param {number} detailId - Detail ID
   * @return {Promise<Order | null>} - Order or null if not found
   */
  public async getByDetailId(detailId: number): Promise<Order | null> {
    return await this.orderRepository.findOne({
      relations: ["user", "details", "details.service"],
      where: { details: { id: detailId } },
    });
  }

  /**
   * Gets all orders for specific user
   * @param {number} userId - User ID
   * @returns {Promise<Order[]>} - Array of user's orders
   */
  public async getByUserId(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ["user", "details", "details.service"],
      where: { user: { id: userId } },
    });
  }

  /**
   * Gets all orders
   * @returns {Promise<Order[]>} - Array of all orders
   */
  public async getAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ["user", "details", "details.service"],
    });
  }

  /**
   * Updates order
   * @param {number} id - Order ID to update
   * @param {OrderUpdateDto} dto - DTO with update data
   * @returns {Promise<Order>} - Updated order
   * @throws {NotFoundException} - If order not found
   * @throws {InternalServerErrorException} - If update fails
   */
  public async update(id: number, dto: OrderUpdateDto): Promise<Order> {
    const { details, ...orderData } = dto;
    const order = await this.getById(id);
    if (!order) {
      this.logger.error(`${OrderErrorMessages.NOT_FOUND} ID: ${id}`);
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    try {
      this.orderRepository.merge(order, orderData);

      if (details) {
        await this.detailService.deleteByOrderId(order.id);
        order.details = await this.detailService.createMany(order, details);
        order.totalPrice = this.calculateTotalPrice(order.details);
      }

      return await this.orderRepository.save(order);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `${OrderErrorMessages.UPDATE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(OrderErrorMessages.UPDATE_ERROR);
    }
  }

  /**
   * Updates order's price
   * @param {number} id - Order ID to update
   * @param {number} price - Updated price
   * @returns {Promise<Order>} - Updated order
   * @throws {NotFoundException} - If order not found
   * @throws {InternalServerErrorException} - If update fails
   */
  public async updatePrice(id: number, price: number): Promise<Order> {
    const order = await this.getById(id);
    if (!order) {
      this.logger.error(`${OrderErrorMessages.NOT_FOUND} ID: ${id}`);
      throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
    }

    try {
      order.totalPrice = price;
      return await this.orderRepository.save(order);
    } catch (error) {
      this.logger.error(
        `${OrderErrorMessages.UPDATE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(OrderErrorMessages.UPDATE_ERROR);
    }
  }

  /**
   * Deletes order by ID
   * @param {number} id - Order ID to delete
   * @return {Promise<boolean>}
   * @throws {NotFoundException} - If order not found
   * @throws {InternalServerErrorException} - If deletion fails
   */
  public async delete(id: number): Promise<boolean> {
    try {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`${OrderErrorMessages.NOT_FOUND} ID: ${id}`);
        throw new NotFoundException(OrderErrorMessages.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `${OrderErrorMessages.DELETE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(OrderErrorMessages.DELETE_ERROR);
    }
    return true;
  }
}
