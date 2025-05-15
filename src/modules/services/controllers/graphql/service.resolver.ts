import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ServiceType } from "@/modules/services/controllers/graphql/types/service.type";
import { ServiceService } from "../../services/service.service";
import { ServiceCreateType } from "@/modules/services/controllers/graphql/types/service-create.type";
import { GraphqlTransformer } from "@/utils/transformers/GraphqlTransformer";
import { ServiceCreateDto } from "@/modules/services/entities/dto/service-create.dto";
import { ServiceUpdateType } from "@/modules/services/controllers/graphql/types/service-update.type";
import { ServiceUpdateDto } from "@/modules/services/entities/dto/service-update.dto";
import { NotFoundException } from "@nestjs/common";

@Resolver(() => ServiceType)
export class ServiceResolver {
  private readonly transformer = new GraphqlTransformer();
  constructor(private readonly serviceService: ServiceService) {}

  @Mutation(() => ServiceType, { name: "createService" })
  async createService(@Args("type") type: ServiceCreateType) {
    const dto = (await this.transformer.toDto(
      ServiceCreateDto,
      type,
    )) as ServiceCreateDto;
    const service = await this.serviceService.create(dto);
    return this.transformer.toType(ServiceType, service) as ServiceType;
  }

  @Query(() => ServiceType, { name: "getService" })
  async getService(@Args("id", { type: () => Int }) id: number) {
    const service = await this.serviceService.getById(id);
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    return this.transformer.toType(ServiceType, service) as ServiceType;
  }

  @Query(() => [ServiceType], { name: "getServices" })
  async getServices() {
    const services = await this.serviceService.getAll();
    if (services.length === 0) {
      throw new NotFoundException("No services found");
    }

    return services.map(
      (service) => this.transformer.toType(ServiceType, service) as ServiceType,
    );
  }

  @Query(() => [ServiceType], { name: "getRentServices" })
  async getRentServices() {
    const services = await this.serviceService.getAll();
    if (services.length === 0) {
      throw new NotFoundException("No services found");
    }

    return services
      .filter((s) => s.isRent)
      .map(
        (service) =>
          this.transformer.toType(ServiceType, service) as ServiceType,
      );
  }

  @Query(() => [ServiceType], { name: "getAdditionalServices" })
  async getAdditionalServices() {
    const services = await this.serviceService.getAll();
    if (services.length === 0) {
      throw new NotFoundException("No services found");
    }

    return services
      .filter((s) => !s.isRent)
      .map(
        (service) =>
          this.transformer.toType(ServiceType, service) as ServiceType,
      );
  }

  @Mutation(() => ServiceType, { name: "updateService" })
  async updateService(
    @Args("id", { type: () => Int }) id: number,
    @Args("type") type: ServiceUpdateType,
  ) {
    const dto = (await this.transformer.toDto(
      ServiceUpdateDto,
      type,
    )) as ServiceUpdateDto;
    const service = await this.serviceService.update(id, dto);
    return this.transformer.toType(ServiceType, service) as ServiceType;
  }

  @Mutation(() => Boolean, { name: "deleteService" })
  async deleteService(@Args("id", { type: () => Int }) id: number) {
    return await this.serviceService.delete(id);
  }
}
