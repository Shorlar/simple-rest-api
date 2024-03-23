import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import * as randomize from 'randomatic';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/shared/enums/role.enum';
import { NotifyUserService } from 'src/shared/notification/notification.service';
import { DBErrors } from 'src/shared/enums/errors.enum';

@Injectable()
export class UsersService {
  private logger: Logger;

  constructor(
    @InjectModel(User)
    private userModel: User,
    private configService: ConfigService,
    private notifyUserService: NotifyUserService,
  ) {
    this.logger = new Logger(UsersService.name);
  }

  async addUser(userDetails: AddUserDto): Promise<string> {
    const { fullName, email, phone, role } = userDetails;

    try {
      const salt = Number(this.configService.get<string>('PASSWORD_SALT'));
      const randomPassword = this.generateRandomPassword(6);

      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      await new User({
        fullName,
        email,
        phone,
        roleId: Roles[role],
        hashedPassword,
      }).save();

      this.logger.log('Done creating user');

      const notificationDetails = {
        fullName,
        email,
        randomPassword,
      };

      this.notifyUserService.sendNotification(notificationDetails);

      return 'New user successfully created';
    } catch (error) {
      this.logger.error(error);

      if (error?.name === DBErrors.UNIQUE_CONSTRAINT)
        throw new HttpException(
          "User's email already exist",
          HttpStatus.CONFLICT,
        );

      throw new HttpException(
        'An Error Occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateRandomPassword(passwordLength: number): string {
    const randomPassword = randomize('Aa0', passwordLength);
    return randomPassword;
  }
}
