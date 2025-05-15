import { plainToInstance } from "class-transformer";
import { BadRequestException } from "@nestjs/common";
import { validate } from "class-validator";
import { BaseDto } from "../base.dto";
import { BaseType } from "../base.type";

export class GraphqlTransformer<
  Dto extends BaseDto,
  Type extends BaseType,
> {
  async toDto(dtoClass: new () => Dto, input: Type): Promise<Dto> {
    const dto = plainToInstance(dtoClass, input, {
      enableImplicitConversion: true,
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) throw new BadRequestException(errors);

    return dto;
  }

  toType(typeClass: new () => Type, input: Dto): Type {
    return plainToInstance(typeClass, input, {
      enableImplicitConversion: true,
    });
  }
}
