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
import { UserDto } from "@/modules/users/entities/dtos/user.dto";
import { plainToInstance } from "class-transformer";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { TimeInterceptor } from "@/utils/interceptors/TimeInterceptor";
import { UserCreateDto } from "@/modules/users/entities/dtos/user-create.dto";
import { UserUpdateDto } from "@/modules/users/entities/dtos/user-update.dto";
import { UserErrorMessages } from "@/modules/users/enums/user-error.messages.enum";
import { RolesGuard } from "@/auth/guard/roles.guard";
import { Roles } from "@/auth/decorator/roles";

@ApiTags("Users controller")
@Controller("api/users")
@UseInterceptors(TimeInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: UserCreateDto })
  @ApiCreatedResponse({ type: UserDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @ApiInternalServerErrorResponse()
  async create(@Body() dto: UserCreateDto): Promise<UserDto> {
    const user = await this.userService.create(dto);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  @Roles(["user, admin"])
  @UseGuards(RolesGuard)
  async getById(@Param("id", ParseIntPipe) id: number): Promise<UserDto> {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get("supertokens/:id")
  async getBySupertokensId(@Param("id") id: string): Promise<UserDto> {
    const user = await this.userService.getBySupertokensId(id);
    if (!user) {
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOkResponse({ type: [UserDto] })
  @ApiNotFoundResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async getAll(): Promise<UserDto[]> {
    const users = await this.userService.getAll();
    if (users.length == 0) {
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    return plainToInstance(UserDto, users, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiBody({ type: UserUpdateDto })
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UserUpdateDto,
  ): Promise<UserDto> {
    const user = await this.userService.update(id, dto);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async delete(@Param("id", ParseIntPipe) id: number): Promise<boolean> {
    return await this.userService.delete(id);
  }
}
