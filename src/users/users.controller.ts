import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { UsersService } from './users.service';

@Controller('/')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('add-user')
  async addUser(@Body() userDetails: AddUserDto): Promise<string> {
    return await this.userService.addUser(userDetails);
  }
}
