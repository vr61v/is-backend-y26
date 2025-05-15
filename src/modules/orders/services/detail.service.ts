import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Detail } from "../entities/detail.entity";
import { ServiceService } from "@/modules/services/services/service.service";
import { Order } from "../entities/order.entity";
import { DetailCreateDto } from "@/modules/orders/entities/dtos/detail/detail-create.dto";
import { ServiceErrorMessages } from "@/modules/services/enums/service-error.messages.enum";
import { DetailErrorMessages } from "@/modules/orders/enums/messages/detail-error.messages.enum";
import { DetailUpdateDto } from "@/modules/orders/entities/dtos/detail/detail-update.dto";

@Injectable()
export class DetailService {
  private readonly logger = new Logger(DetailService.name);
  constructor(
    @InjectRepository(Detail)
    private readonly detailRepository: Repository<Detail>,
    private readonly serviceService: ServiceService,
  ) {}

  /**
   * Creates a new detail
   * @param {Order} order - The associated order
   * @param {DetailCreateDto} dto - DTO with detail data
   * @returns {Promise<Detail>} - The created detail
   * @throws {NotFoundException} - If service was not found
   * @throws {InternalServerErrorException} - If creation fails
   */
  public async create(order: Order, dto: DetailCreateDto): Promise<Detail> {
    const service = await this.serviceService.getById(dto.serviceId);
    if (!service) {
      this.logger.error(
        `${ServiceErrorMessages.NOT_FOUND} ID: ${dto.serviceId}`,
      );
      throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
    }

    try {
      const detail = this.detailRepository.create({
        ...dto,
        order,
        service,
      });
      return await this.detailRepository.save(detail);
    } catch (error) {
      this.logger.error(`${DetailErrorMessages.CREATE_ERROR}: ${error}`);
      throw new InternalServerErrorException(DetailErrorMessages.CREATE_ERROR);
    }
  }

  /**
   * Creates multiple details at once
   * @param {Order} order - The associated order
   * @param {DetailCreateDto[]} dtos - Array of DTOs with detail data
   * @returns {Promise<Detail[]>} - Array of created details
   * @throws {NotFoundException} - If any service was not found
   * @throws {InternalServerErrorException} - If creation fails
   */
  public async createMany(order: Order, dtos: DetailCreateDto[]): Promise<Detail[]> {
    const serviceIds = dtos.map((dto) => dto.serviceId);
    const services = await Promise.all(
      serviceIds.map((id) => this.serviceService.getById(id)),
    );

    try {
      const details = dtos.map((dto, index) => {
        if (services[index] === null) {
          this.logger.error(
            `${ServiceErrorMessages.NOT_FOUND} ID: ${serviceIds[index]}`,
          );
          throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
        }

        return this.detailRepository.create({
          ...dto,
          order,
          service: services[index],
        });
      });
      return await this.detailRepository.save(details);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`${DetailErrorMessages.CREATE_ERROR}: ${error}`);
      throw new InternalServerErrorException(DetailErrorMessages.CREATE_ERROR);
    }
  }

  /**
   * Retrieves a detail by ID
   * @param {number} id - Detail ID to find
   * @returns {Promise<Detail | null>} - Found detail or null if not exists
   */
  public async getById(id: number): Promise<Detail | null> {
    return await this.detailRepository.findOne({
      relations: ["order", "service"],
      where: { id },
    });
  }

  /**
   * Retrieves all details for a specific order
   * @param {number} orderId - Order ID to find details for
   * @returns {Promise<Detail[]>} - Array of details or empty array if none found
   */
  public async getByOrderId(orderId: number): Promise<Detail[]> {
    return await this.detailRepository.find({
      relations: ["order", "service"],
      where: { order: { id: orderId } },
    });
  }

  /**
   * Retrieves all details
   * @returns {Promise<Detail[]>} - Array of all details or empty array if none found
   */
  public async getAll(): Promise<Detail[]> {
    return await this.detailRepository.find({
      relations: ["order", "service"],
    });
  }

  /**
   * Updates an existing detail
   * @param {number} id - ID of detail to update
   * @param {DetailUpdateDto} dto - DTO with update data
   * @returns {Promise<Detail>} - Updated detail entity
   * @throws {NotFoundException} - If detail or service was not found
   * @throws {InternalServerErrorException} - If update fails
   */
  public async update(id: number, dto: DetailUpdateDto): Promise<Detail> {
    const detail = await this.getById(id);
    if (!detail) {
      this.logger.error(`${DetailErrorMessages.NOT_FOUND} ID: ${id}`);
      throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
    }

    if (dto.serviceId) {
      const service = await this.serviceService.getById(dto.serviceId);
      if (!service) {
        this.logger.error(`${ServiceErrorMessages.NOT_FOUND} ID: ${id}`);
        throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
      }

      detail.service = service;
    }

    try {
      this.detailRepository.merge(detail, dto);
      return await this.detailRepository.save(detail);
    } catch (error) {
      this.logger.error(
        `${DetailErrorMessages.UPDATE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(DetailErrorMessages.UPDATE_ERROR);
    }
  }

  /**
   * Deletes a detail by ID
   * @param {number} id - ID of detail to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If detail with ID was not found
   * @throws {InternalServerErrorException} - If deletion fails
   */
  public async delete(id: number): Promise<boolean> {
    try {
      const result = await this.detailRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`${DetailErrorMessages.NOT_FOUND} ID: ${id}`);
        throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `${DetailErrorMessages.DELETE_ERROR} ID ${id}: ${error}`,
      );
      throw new InternalServerErrorException(DetailErrorMessages.DELETE_ERROR);
    }

    return true;
  }

  /**
   * Deletes all details for a specific order
   * @param {number} orderId - Order ID to delete details for
   * @returns {Promise<boolean>}
   * @throws {NotFoundException} - If no details found for order
   * @throws {InternalServerErrorException} - If deletion fails
   */
  public async deleteByOrderId(orderId: number): Promise<boolean> {
    try {
      const result = await this.detailRepository.delete({
        order: { id: orderId },
      });
      if (result.affected === 0) {
        this.logger.error(`${DetailErrorMessages.NOT_FOUND} ID: ${orderId}`);
        throw new NotFoundException(DetailErrorMessages.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `${DetailErrorMessages.DELETE_ERROR} ID ${orderId}: ${error}`,
      );
      throw new InternalServerErrorException(DetailErrorMessages.DELETE_ERROR);
    }

    return true;
  }
}
