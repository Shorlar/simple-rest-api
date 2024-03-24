import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { UsersService } from './users.service';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from '../shared/decorators/isPublic.decorator';
import { Role } from '../shared/decorators/role.decorator';
import { Roles } from '../shared/enums/role.enum';
import { SignedInUser } from '../shared/types/signIn.user.type';
import { SignInUser } from '../shared/decorators/signIn-user.decorator';
import { GetUserDto } from './dto/get-user.dto';

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

  @Get('get-user/:id')
  async getUserById(
    @SignInUser() user: SignedInUser,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<GetUserDto> {
    return await this.userService.getUserById(userId, user);
  }
}
