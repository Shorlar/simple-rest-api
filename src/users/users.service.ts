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
import { Roles } from '../shared/enums/role.enum';
import { NotifyUserService } from '../shared/notification/notification.service';
import { DBErrors } from '../shared/enums/errors.enum';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { Role } from './models/role.model';
import { SignedInUser } from '../shared/types/signIn.user.type';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  private logger: Logger;

  constructor(
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
    const user = await this.fetchUserWithEmail(email);

    if (!user) throw new UnauthorizedException();

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

    if (!isValidPassword) throw new UnauthorizedException();

    const payload = { username: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async fetchUserWithEmail(email: string): Promise<User | undefined> {
    return await User.findOne({
      where: { email },
      include: [{ model: Role }],
    });
  }

  async fetchUserWithId(id: number): Promise<User | undefined> {
    return await User.findOne({
      where: { id },
    });
  }

  async getUserById(
    userId: number,
    signedInUser: SignedInUser,
  ): Promise<GetUserDto> {
    const { id, role } = signedInUser;

    let user: User = null;
    if (role === Roles.USER) {
      user = await this.fetchUserWithId(id);
    } else {
      user = await this.fetchUserWithId(userId);
    }

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return new GetUserDto(user);
  }

  async createAdminUser(): Promise<void> {
    this.logger.log('creating admin user');
    const adminUserEmail = this.configService.get<string>('ADMIN_USER_EMAIL');

    const user = await this.fetchUserWithEmail(adminUserEmail);

    const salt = Number(this.configService.get<string>('PASSWORD_SALT'));
    const randomPassword = this.generateRandomPassword(6);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    await user.update({ hashedPassword });
    await user.save();

    const notificationDetails = {
      fullName: user.fullName,
      email: user.email,
      randomPassword,
    };

    // notify admin user of their new password
    this.notifyUserService.sendNotification(notificationDetails);
    return;
  }
}
