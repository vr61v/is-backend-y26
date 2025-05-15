import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { UserStatus } from "@/modules/users/enums/user.status.enum";
import { Order } from "@/modules/orders/entities/order.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "supertokens_id" })
  supertokensId: string;

  @Column({ name: "full_name" })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({
    name: "status",
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
