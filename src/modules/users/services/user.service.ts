import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { UserErrorMessages } from "@/modules/users/enums/user-error.messages.enum";
import { UserCreateDto } from "@/modules/users/entities/dtos/user-create.dto";
import { UserUpdateDto } from "@/modules/users/entities/dtos/user-update.dto";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Checks if a user with the given email already exists
   * @param email The email to check
   * @throws ConflictException if email already exists
   */
  public async validateExistEmail(email: string): Promise<void> {
    const user = await this.getByEmail(email);
    if (user != null) {
      this.logger.error(
        `${UserErrorMessages.CONFLICT_EMAIL_EXCEPTION} email: ${user.email}`,
      );
      throw new ConflictException(UserErrorMessages.CONFLICT_EMAIL_EXCEPTION);
    }
  }
  /**
   * Creates a new user
   * @param {UserCreateDto} dto - DTO with user data
   * @returns {Promise<User>} - The created user
   * @throws {ConflictException} - If email already exists
   * @throws {InternalServerErrorException} - If creation fails
   */
  public async create(dto: UserCreateDto): Promise<User> {
    await this.validateExistEmail(dto.email);
    try {
      const user = this.userRepository.create(dto);
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.logger.error(`${UserErrorMessages.CREATE_ERROR}: ${error}`);
      throw new InternalServerErrorException(UserErrorMessages.CREATE_ERROR);
    }
  }

  /**
   * Retrieves a user by ID with cache support
   * @param {number} id - User ID to find
   * @returns {Promise<User | null>} - Found user or null if not exists
   */
  public async getById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      relations: ["orders"],
      where: { id },
    });
  }

  public async getBySupertokensId(supertokensId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      relations: ["orders"],
      where: { supertokensId },
    });
  }

  /**
   * Retrieves a user by email with cache support
   * @param {string} email - User email to find
   * @returns {Promise<User | null>} - Found user or null if not exists
   */
  public async getByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      relations: ["orders"],
      where: { email },
    });
  }

  /**
   * Retrieves all users with their orders with cache support
   * @returns {Promise<User[]>} - Array of users or empty array if none found
   */
  public async getAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ["orders"],
    });
  }

  /**
   * Updates an existing user
   * @param {number} id - ID of user to update
   * @param {UserUpdateDto} dto - DTO with update data
   * @returns {Promise<User>} - Updated user entity
   * @throws {ConflictException} - If email already exists
   * @throws {NotFoundException} - If user with ID not found
   * @throws {InternalServerErrorException} - If update fails
   */
  public async update(id: number, dto: UserUpdateDto): Promise<User> {
    if (dto.email) await this.validateExistEmail(dto.email);

    const user = await this.getById(id);
    if (!user) {
      this.logger.error(`${UserErrorMessages.NOT_FOUND} ID: ${id}`);
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    try {
      this.userRepository.merge(user, dto);
      await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        `${UserErrorMessages.UPDATE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(UserErrorMessages.UPDATE_ERROR);
    }

    return user;
  }

  /**
   * Deletes a user by ID
   * @param {number} id - ID of user to delete
   * @returns {Promise<boolean>} - True if deletion was successful
   * @throws {NotFoundException} - If user with ID not found
   * @throws {InternalServerErrorException} - If deletion fails
   */
  public async delete(id: number): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`${UserErrorMessages.NOT_FOUND} ID: ${id}`);
        throw new NotFoundException(UserErrorMessages.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `${UserErrorMessages.DELETE_ERROR} ID: ${id}: ${error}`,
      );
      throw new InternalServerErrorException(UserErrorMessages.DELETE_ERROR);
    }

    return true;
  }
}
