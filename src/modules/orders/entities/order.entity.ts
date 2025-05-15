import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "@/modules/users/entities/user.entity";
import { Detail } from "./detail.entity";
import { OrderStatus } from "@/modules/orders/enums/order.status.enum";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Detail, (detail) => detail.order)
  details: Detail[];

  @Column({ name: "total_price" })
  totalPrice: number;

  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
