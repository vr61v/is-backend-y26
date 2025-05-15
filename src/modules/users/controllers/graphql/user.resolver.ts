import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserType } from "@/modules/users/controllers/graphql/types/user.type";
import { UserService } from "../../services/user.service";
import { UserCreateDto } from "@/modules/users/entities/dtos/user-create.dto";
import { UserCreateType } from "@/modules/users/controllers/graphql/types/user-create.type";
import { GraphqlTransformer } from "@/utils/transformers/GraphqlTransformer";
import { NotFoundException } from "@nestjs/common";
import { UserUpdateType } from "@/modules/users/controllers/graphql/types/user-update.type";
import { UserUpdateDto } from "@/modules/users/entities/dtos/user-update.dto";
import { UserErrorMessages } from "@/modules/users/enums/user-error.messages.enum";

@Resolver(() => UserType)
export class UserResolver {
  private readonly transformer = new GraphqlTransformer();
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserType, { name: "createUser" })
  async createUser(@Args("type") type: UserCreateType) {
    const dto = (await this.transformer.toDto(
      UserCreateDto,
      type,
    )) as UserCreateDto;
    const user = await this.userService.create(dto);
    return this.transformer.toType(UserType, user) as UserType;
  }

  @Query(() => UserType, { name: "getUserById" })
  async getUserById(@Args("id", { type: () => Int }) id: number) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    return this.transformer.toType(UserType, user) as UserType;
  }

  @Query(() => UserType, { name: "getUserByEmail" })
  async getUserByEmail(@Args("email", { type: () => String }) email: string) {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    return this.transformer.toType(UserType, user) as UserType;
  }

  @Query(() => [UserType], { name: "getAllUsers" })
  async getAllUsers() {
    const users = await this.userService.getAll();
    if (users.length == 0) {
      throw new NotFoundException(UserErrorMessages.NOT_FOUND);
    }

    return users.map(
      (user) => this.transformer.toType(UserType, user) as UserType,
    );
  }

  @Mutation(() => UserType, { name: "updateUser" })
  async updateUser(
    @Args("id", { type: () => Int }) id: number,
    @Args("type") type: UserUpdateType,
  ) {
    const dto = (await this.transformer.toDto(
      UserUpdateDto,
      type,
    )) as UserUpdateDto;
    const user = await this.userService.update(id, dto);

    return this.transformer.toType(UserType, user) as UserType;
  }

  @Mutation(() => Boolean, { name: "deleteUser" })
  async deleteUser(@Args("id", { type: () => Int }) id: number) {
    return await this.userService.delete(id);
  }
}
