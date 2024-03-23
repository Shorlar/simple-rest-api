import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { UsersService } from './users.service';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from 'src/shared/decorators/isPublic.decorator';
import { Role } from 'src/shared/decorators/role.decorator';
import { Roles } from 'src/shared/enums/role.enum';

@Controller('/')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('add-user')
  @Role(Roles.ADMIN)
  async addUser(@Body() userDetails: AddUserDto): Promise<string> {
    return await this.userService.addUser(userDetails);
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() signInData: SignInDto): Promise<Record<string, string>> {
    return await this.userService.SignIn(signInData);
  }
}
