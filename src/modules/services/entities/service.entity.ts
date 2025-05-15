import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Detail } from "@/modules/orders/entities/detail.entity";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name_value", unique: true })
  nameValue: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ name: "is_rent" })
  isRent: boolean;

  @OneToMany(() => Detail, (details) => details.service)
  details: Detail[];
}
