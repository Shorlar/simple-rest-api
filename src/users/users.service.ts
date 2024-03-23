import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import * as randomize from 'randomatic';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/shared/enums/role.enum';
import { NotifyUserService } from 'src/shared/notification/notification.service';
import { DBErrors } from 'src/shared/enums/errors.enum';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { Role } from './models/role.model';

@Injectable()
export class UsersService {
  private logger: Logger;

  constructor(
    @InjectModel(User)
    private userModel: User,
    private configService: ConfigService,
    private notifyUserService: NotifyUserService,
    private jwtService: JwtService,
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

  async SignIn({
    email,
    password,
  }: SignInDto): Promise<Record<string, string>> {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role }],
    });

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

    if (!isValidPassword) throw new UnauthorizedException();

    const payload = { username: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
