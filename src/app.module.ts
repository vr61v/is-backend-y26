import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@/modules/users/user.module";
import { User } from "@/modules/users/entities/user.entity";
import { OrderModule } from "@/modules/orders/order.module";
import { Order } from "@/modules/orders/entities/order.entity";
import { Service } from "@/modules/services/entities/service.entity";
import { ServiceModule } from "@/modules/services/service.module";
import { CreateUsersTable1740394719390 } from "./migrations/1740394719390-CreateUsersTable";
import { CreateServicesTable1740394719391 } from "./migrations/1740394719391-CreateServicesTable";
import { FillServicesTable1740394719392 } from "./migrations/1740394719392-FillServicesTable";
import { CreateOrdersTable1740394719393 } from "./migrations/1740394719393-CreateOrdersTable";
import { CreateDetailsTable1740394719394 } from "./migrations/1740394719394-CreateDetailsTable";
import { Detail } from "@/modules/orders/entities/detail.entity";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { S3Module } from "./s3/s3.module";
import { ConfigModule } from "@nestjs/config";
import * as process from "node:process";
import { SuperTokensModule } from "supertokens-nestjs";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import UserRoles from "supertokens-node/recipe/userroles";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "@/auth/guard/roles.guard";

@Module({
  imports: [
    SuperTokensModule.forRoot({
      framework: "express",
      supertokens: {
        connectionURI:
          "https://st-dev-30506f70-22b8-11f0-993f-89d9ebadd3e9.aws.supertokens.io",
        apiKey: "j2YWmjh4OqpTyMTqR80RlKzfjC",
      },
      appInfo: {
        appName: "localstar",
        apiDomain: "http://localhost:3000",
        websiteDomain: "http://localhost:3000",
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
      },
      recipeList: [
        EmailPassword.init({
          signUpFeature: {
            formFields: [{ id: "email" }, { id: "password" }],
          },
          override: {
            apis: (originalImplementation) => {
              return {
                ...originalImplementation,
                signUpPOST: async function (input) {
                  if (!originalImplementation.signUpPOST)
                    throw Error("Should never come here");
                  const response =
                    await originalImplementation.signUpPOST(input);
                  if (response.status === "OK") {
                    const data = {
                      email: input.formFields[0]["value"],
                      password: input.formFields[1]["value"],
                      supertokensId: response.user.id,
                      fullName: "unsupported",
                    };
                    const created = await fetch(
                      "http://localhost:3000/api/users",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      },
                    );
                    if (!created.ok) throw new Error(created.statusText);
                    await UserRoles.addRoleToUser(
                      "public",
                      response.user.id,
                      "user",
                    );
                  }
                  return response;
                },
              };
            },
          },
        }),
        Session.init({
          override: {
            functions: (originalImplementation) => {
              return {
                ...originalImplementation,
                createNewSession: async function (input) {
                  const roles = await UserRoles.getRolesForUser(
                    "public",
                    input.userId,
                  );
                  input.accessTokenPayload = {
                    ...input.accessTokenPayload,
                    "st-role": {
                      v: roles.roles,
                      t: Date.now(),
                    },
                  };
                  return originalImplementation.createNewSession(input);
                },
              };
            },
          },
        }),
        UserRoles.init(),
      ],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "./.env",
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
    }),

    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Order, Detail, Service],
      migrations: [
        CreateUsersTable1740394719390,
        CreateServicesTable1740394719391,
        FillServicesTable1740394719392,
        CreateOrdersTable1740394719393,
        CreateDetailsTable1740394719394,
      ],
      migrationsRun: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    UserModule,
    OrderModule,
    ServiceModule,
    S3Module,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
