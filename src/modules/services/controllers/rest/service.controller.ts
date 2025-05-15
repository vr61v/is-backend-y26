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
import { ServiceService } from "../../services/service.service";
import { ServiceDto } from "@/modules/services/entities/dto/service.dto";
import { plainToInstance } from "class-transformer";
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { TimeInterceptor } from "@/utils/interceptors/TimeInterceptor";
import { ServiceCreateDto } from "@/modules/services/entities/dto/service-create.dto";
import { ServiceUpdateDto } from "@/modules/services/entities/dto/service-update.dto";
import { ServiceErrorMessages } from "@/modules/services/enums/service-error.messages.enum";
import { Roles } from "@/auth/decorator/roles";
import { RolesGuard } from "@/auth/guard/roles.guard";

@ApiTags("Services controller")
@Controller("api/services")
@UseInterceptors(TimeInterceptor)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiBody({ type: ServiceCreateDto })
  @ApiCreatedResponse({ type: ServiceDto })
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async create(@Body() dto: ServiceCreateDto): Promise<ServiceDto> {
    const service = await this.serviceService.create(dto);
    return plainToInstance(ServiceDto, service, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiOkResponse({ type: ServiceDto })
  @ApiNotFoundResponse()
  async getById(@Param("id", ParseIntPipe) id: number): Promise<ServiceDto> {
    const service = await this.serviceService.getById(id);
    if (!service) {
      throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
    }

    return plainToInstance(ServiceDto, service, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOkResponse({ type: [ServiceDto] })
  @ApiNotFoundResponse()
  async getAll(): Promise<ServiceDto[]> {
    const services = await this.serviceService.getAll();
    if (services.length === 0) {
      throw new NotFoundException(ServiceErrorMessages.NOT_FOUND);
    }

    return plainToInstance(ServiceDto, services, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(":id")
  @ApiParam({ name: "id", required: true, type: Number })
  @ApiBody({ type: ServiceUpdateDto })
  @ApiOkResponse({ type: ServiceDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @Roles(["admin"])
  @UseGuards(RolesGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ServiceUpdateDto,
  ): Promise<ServiceDto> {
    const service = await this.serviceService.update(id, dto);
    return plainToInstance(ServiceDto, service, {
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
    return await this.serviceService.delete(id);
  }
}
