import { registerEnumType } from "@nestjs/graphql";

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BLOCKED = "blocked",
}

registerEnumType(UserStatus, { name: "UserStatus" });
