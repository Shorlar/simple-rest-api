import { Column, HasMany, Table, Model } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Role extends Model {
  @Column
  name: string;

  @Column
  description: string;

  @HasMany(() => User)
  users: User[];
}