import { Controller, Get, OnApplicationBootstrap } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController implements OnApplicationBootstrap {
  constructor(
    private readonly appService: AppService,
    private userService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.userService.createAdminUser();
  }
}
