import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Service } from "../entities/service.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ServiceEvent } from "../entities/service.event";
import { ServiceErrorMessages } from "@/modules/services/enums/service-error.messages.enum";
import { EventOperation } from "@/modules/services/enums/event.operation.enum";
import { ServiceCreateDto } from "@/modules/services/entities/dto/service-create.dto";
import { ServiceUpdateDto } from "@/modules/services/entities/dto/service-update.dto";

@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);
  private readonly CACHE_TTL = 60_000;
  private readonly NAME_VALUE_REGEX = /^[a-z-]+$/;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Validates the format of nameValue, valid format is ^[a-z-]+$
   * @param {string} nameValue - The value to validate
   * @throws {BadRequestException} - If format is invalid
   */
  private validateNameValueFormat(nameValue: string): void {
    if (!this.NAME_VALUE_REGEX.test(nameValue)) {
      this.logger.error(ServiceErrorMessages.INVALID_NAME_FORMAT);
      throw new BadRequestException(ServiceErrorMessages.INVALID_NAME_FORMAT);
    }
  }

  /**
   * Checks if a service with the given nameValue already exists
   * @param {string} nameValue - The nameValue to check
   * @throws {ConflictException} - If nameValue already exists
   */
  private async validateExistNameValue(
    nameValue: string | undefined,
  ): Promise<void> {
    if (!nameValue) return;
    const service = await this.serviceRepository.findOne({
      where: { nameValue },
    });

    if (service != null) {
      this.logger.error(
        `${ServiceErrorMessages.CONFLICT_NAME_VALUE_EXCEPTION} name_value: ${nameValue}`,
      );
      throw new ConflictException(
        ServiceErrorMessages.CONFLICT_NAME_VALUE_EXCEPTION,
      );
    }
  }

  private getCacheKey(id: number): string {
    return `service:${id}`;
  }

  private getCacheKeyAll(): string {
    return "service:all";
  }

  private async deleteCache(id: number): Promise<void> {
    try {
      await Promise.all([
        this.cache.del(this.getCacheKey(id)),
        this.cache.del(this.getCacheKeyAll()),
      ]);
    } catch (error) {
      this.logger.error(
        `${ServiceErrorMessages.CACHE_CLEAR_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(
        ServiceErrorMessages.CACHE_CLEAR_ERROR,
      );
    }
  }

  /**
   * Creates a new service
   * @param {ServiceCreateDto} dto - DTO with service data
   * @returns {Promise<Service>} - The created service
   * @throws {BadRequestException} - If nameValue format is invalid
   * @throws {ConflictException} - If nameValue already exists
   * @throws {InternalServerErrorException} - If creation fails
   */
  public async create(dto: ServiceCreateDto): Promise<Service> {
    this.validateNameValueFormat(dto.nameValue);
    await this.validateExistNameValue(dto.nameValue);

    try {
      const service = this.serviceRepository.create(dto);
      await this.serviceRepository.save(service);

      this.eventEmitter.emit(
        EventOperation.CREATE,
        new ServiceEvent(service.name),
      );
      return service;
    } catch (error) {
      this.logger.error(`${ServiceErrorMessages.CREATE_ERROR}: ${error}`);
      throw new InternalServerErrorException(ServiceErrorMessages.CREATE_ERROR);
    }
  }

  /**
   * Retrieves a service by ID with cache support
   * @param {number} id - Service ID to find
   * @returns {Promise<Service | null>} - Found service or null if not exists
   */
  public async getById(id: number): Promise<Service | null> {
    const key = this.getCacheKey(id);
    const cache = await this.cache.get<Service>(key);
    if (cache) return cache;

    const service = await this.serviceRepository.findOne({ where: { id } });
    if (service) {
      await this.cache.set(key, service, this.CACHE_TTL);
    }

    return service;
  }

  /**
   * Retrieves all services ordered by isRent flag (DESC) with cache support
   * @returns {Promise<Service[]>} - Array of services or empty array if none found
   */
  public async getAll(): Promise<Service[]> {
    const key = this.getCacheKeyAll();
    const cache = await this.cache.get<Service[]>(key);
    if (cache) return cache;

    const services = await this.serviceRepository.find({
      order: { isRent: "DESC" },
    });
    if (services.length != 0) {
      await this.cache.set(key, services, this.CACHE_TTL);
    }

    return services;
  }

  /**
   * Updates an existing service
   * @param {number} id - ID of service to update
   * @param {ServiceUpdateDto} dto - DTO with update data
   * @returns {Promise<Service>} - Updated service entity
   * @throws {BadRequestException} - If nameValue format is invalid
   * @throws {ConflictException} - If nameValue already exists
   * @throws {NotFoundException} - If service with ID not found
   * @throws {InternalServerErrorException} - If update fails
   */
  public async update(id: number, dto: ServiceUpdateDto): Promise<Service> {
    if (dto.nameValue) {
      this.validateNameValueFormat(dto.nameValue);
      await this.validateExistNameValue(dto.nameValue);
    }
    const service = await this.getById(id);
    if (!service) {
      this.logger.error(`${ServiceErrorMessages.NOT_FOUND} ID: ${id}`);
      throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
    }

    try {
      this.serviceRepository.merge(service, dto);
      await this.serviceRepository.save(service);
      this.eventEmitter.emit(
        EventOperation.UPDATE,
        new ServiceEvent(service.name),
      );
    } catch (error) {
      this.logger.error(
        `${ServiceErrorMessages.UPDATE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(ServiceErrorMessages.UPDATE_ERROR);
    }

    await this.deleteCache(id);
    return service;
  }

  /**
   * Deletes a service by ID
   * @param {number} id - ID of service to delete
   * @returns {Promise<boolean>}
   * @throws {NotFoundException} - If service with ID not found
   * @throws {InternalServerErrorException} - If deletion fails
   */
  public async delete(id: number): Promise<boolean> {
    const service = await this.getById(id);
    if (!service) {
      this.logger.error(`${ServiceErrorMessages.NOT_FOUND} ID: ${id}`);
      throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
    }

    try {
      await this.serviceRepository.delete(id);
      this.eventEmitter.emit(
        EventOperation.DELETE,
        new ServiceEvent(service.name),
      );
    } catch (error) {
      this.logger.error(
        `${ServiceErrorMessages.DELETE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(ServiceErrorMessages.DELETE_ERROR);
    }

    await this.deleteCache(id);
    return true;
  }
}
