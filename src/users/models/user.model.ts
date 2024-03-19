import {
  BelongsTo,
  Column,
  ForeignKey,
  Table,
  Model,
} from 'sequelize-typescript';
import { Role } from './role.model';

@Table
export class User extends Model {
  @Column
  fullName: string;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  hashedPassword: string;

  @ForeignKey(() => Role)
  @Column
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;
}
