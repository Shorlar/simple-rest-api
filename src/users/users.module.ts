import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Role } from './models/role.model';
import { NotifyUserService } from 'src/shared/notification/notification.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService, NotifyUserService],
})
export class UsersModule {}
