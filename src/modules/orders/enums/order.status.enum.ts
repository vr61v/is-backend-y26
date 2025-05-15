import { registerEnumType } from "@nestjs/graphql";

export enum OrderStatus {
  PENDING = "pending",
  IN_EXECUTE = "in_execute",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

registerEnumType(OrderStatus, { name: "OrderStatus" });
