import { Get, Controller, Render } from "@nestjs/common";
import * as path from "node:path";
import * as fs from "node:fs";
import { ServiceService } from "@/modules/services/services/service.service";

@Controller()
export class AppController {
  constructor(private readonly serviceService: ServiceService) {}
  private loadJson(filename: string): JSON {
    const filePath = path.join(__dirname, "..", "public", "data", filename);
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as JSON;
  }

  @Get("/home")
  @Render("home")
  async root() {
    const services = await this.serviceService.getAll();
    return {
      page: "home",
      headerData: this.loadJson("header.json"),
      instrumentsData: this.loadJson("instruments.json"),
      creditsData: this.loadJson("credits.json"),
      engineersData: this.loadJson("engineers.json"),
      contactsData: this.loadJson("contacts.json"),
      servicesData: services.map((service) => ({
        id: service.id,
        nameValue: service.nameValue,
        name: service.name,
        description: service.description,
        price: service.price,
        isRent: service.isRent,
      })),
    };
  }

  @Get("/login")
  @Render("login")
  login() {
    return {
      page: "login",
    };
  }

  @Get("/signup")
  @Render("signup")
  signup() {
    return {
      page: "signup",
    };
  }

  @Get("/user")
  @Render("user")
  async user() {
    const services = await this.serviceService.getAll();
    return {
      page: "aккаунт",
      servicesData: services.map((service) => ({
        id: service.id,
        nameValue: service.nameValue,
        name: service.name,
        description: service.description,
        price: service.price,
        isRent: service.isRent,
      })),
    };
  }
}
