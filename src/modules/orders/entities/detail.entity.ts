import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Order } from "./order.entity";
import { Service } from "@/modules/services/entities/service.entity";

@Entity("details")
export class Detail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.details)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Service, (service) => service.details)
  @JoinColumn({ name: "service_id" })
  service: Service;

  @Column()
  quantity: number;
}
