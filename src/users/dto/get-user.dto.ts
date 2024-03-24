import { User } from '../models/user.model';

export class GetUserDto {
  private id: number;
  private email: string;
  private fullName: string;
  private phone: string;
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.phone = user.phone;
  }
}
