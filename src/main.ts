import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as path from "path";
import * as hbs from "hbs";
import * as glob from "glob";
import * as fs from "node:fs";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as process from "node:process";
import { SuperTokensExceptionFilter } from "supertokens-nestjs";
import supertokens from "supertokens-node";
import { middleware } from "supertokens-node/framework/express";
import UserRoles from "supertokens-node/recipe/userroles";
import EmailPassword from "supertokens-node/recipe/emailpassword";

function bootHbs(app: NestExpressApplication) {
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(path.join(__dirname, "..", "public"));
  app.setBaseViewsDir(path.join(__dirname, "..", "public", "views"));
  const files = glob.sync(
    path.join(__dirname, "..", "public", "views", "*.hbs"),
  );
  console.log(files);

  glob
    .sync(
      path.join(__dirname, "..", "public", "views", "partials", "**", "*.hbs"),
    )
    .forEach((filePath) => {
      hbs.registerPartial(
        path.basename(filePath, ".hbs"),
        fs.readFileSync(filePath, "utf8"),
      );
    });

  app.setViewEngine("hbs");
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle("LOCAL STAR API")
    .setDescription("local star api")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
}

async function bootSupertokens(app: NestExpressApplication) {
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
  });
  app.useGlobalFilters(new SuperTokensExceptionFilter());
  app.use(middleware());
  await UserRoles.createNewRoleOrAddPermissions("admin", []);
  await UserRoles.createNewRoleOrAddPermissions("user", []);

  const adminEmail = "admin@admin.com";
  const adminPassword = "admin123";
  const responseSignUp = await EmailPassword.signUp(
    "public",
    adminEmail,
    adminPassword,
  );
  const responseSignIn = await EmailPassword.signIn(
    "public",
    adminEmail,
    adminPassword,
  );

  if (responseSignUp.status === "OK") {
    await UserRoles.addRoleToUser("public", responseSignUp.user.id, "admin");
  } else if (responseSignIn.status === "OK") {
    await UserRoles.addRoleToUser("public", responseSignIn.user.id, "admin");
  } else {
    throw new Error("Admin user cannot be signUp or signIn!");
  }

  console.log("admin credentials: ", adminEmail, adminPassword);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    forceCloseConnections: true,
  });
  bootHbs(app);
  await bootSupertokens(app);
  await app.listen(process.env.PORT ? process.env.PORT : 3000);
}
void bootstrap();
