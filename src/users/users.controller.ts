import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { UsersService } from './users.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('/')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('add-user')
  async addUser(@Body() userDetails: AddUserDto): Promise<string> {
    return await this.userService.addUser(userDetails);
  }

  @Post('sign-in')
  async signIn(@Body() signInData: SignInDto): Promise<Record<string, string>> {
    return await this.userService.SignIn(signInData);
  }
}
