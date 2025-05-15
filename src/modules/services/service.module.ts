import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Service } from "./entities/service.entity";
import { ServiceService } from "./services/service.service";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ServiceEventsController } from "./controllers/rest/service.event";
import { ServiceResolver } from "./controllers/graphql/service.resolver";
import { CacheModule } from "@nestjs/cache-manager";
import { ServiceController } from "@/modules/services/controllers/rest/service.controller";

@Module({
  controllers: [ServiceController, ServiceEventsController],
  providers: [ServiceService, ServiceResolver],
  exports: [ServiceService],
  imports: [
    CacheModule.register({
      ttl: 60_000,
      max: 20,
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Service]),
    EventEmitterModule.forRoot(),
  ],
})
export class ServiceModule {}
