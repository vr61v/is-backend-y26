import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./services/user.service";
import { User } from "./entities/user.entity";
import { UserResolver } from "./controllers/graphql/user.resolver";
import { UserController } from "@/modules/users/controllers/user.controller";

@Module({
  controllers: [UserController],
  providers: [UserService, UserResolver],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
