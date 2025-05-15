import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";

import { OrderService } from "./services/order.service";
import { UserModule } from "@/modules/users/user.module";
import { ServiceModule } from "@/modules/services/service.module";
import { Detail } from "./entities/detail.entity";
import { DetailService } from "./services/detail.service";
import { DetailResolver } from "./controllers/graphql/detail.resolver";
import { OrderResolver } from "./controllers/graphql/order.resolver";
import { OrderController } from "@/modules/orders/controllers/rest/order.controller";
import { DetailController } from "@/modules/orders/controllers/rest/detail.controller";

@Module({
  controllers: [OrderController, DetailController],
  providers: [OrderService, DetailService, DetailResolver, OrderResolver],
  exports: [OrderService, DetailService],
  imports: [
    UserModule,
    ServiceModule,
    TypeOrmModule.forFeature([Order, Detail]),
  ],
})
export class OrderModule {}
