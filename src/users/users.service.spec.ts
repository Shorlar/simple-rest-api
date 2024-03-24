import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { NotifyUserService } from '../shared/notification/notification.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';
import { GetUserDto } from './dto/get-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('./models/user.model');
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let configServiceMock: Partial<ConfigService>;
  let notifyUserServiceMock: Partial<NotifyUserService>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn(),
    };
    notifyUserServiceMock = {
      sendNotification: jest.fn(),
    };
    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mockAccessToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: NotifyUserService, useValue: notifyUserServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user with a random password and send notification', async () => {
    const userDetails = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      role: 'USER',
    };
    const mockSalt = 10;
    const mockRandomPassword = 'randomPassword';
    const mockHashedPassword = 'hashedPassword';

    configServiceMock.get('');
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce(mockHashedPassword);
    (service as any).generateRandomPassword = jest
      .fn()
      .mockReturnValueOnce(mockRandomPassword);

    const result = await service.addUser(userDetails);

    expect(User.prototype.save).toHaveBeenCalledWith();
    expect(notifyUserServiceMock.sendNotification).toHaveBeenCalledWith({
      fullName: userDetails.fullName,
      email: userDetails.email,
      randomPassword: mockRandomPassword,
    });
    expect(result).toEqual('New user successfully created');
  });

  it('should return user details for a valid user ID', async () => {
    const userId = 1;
    const signedInUser = { id: userId, role: 2, email: 'test@example.com' };
    const mockUser = {
      id: userId,
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
    } as User;
    const expectedDto = new GetUserDto(mockUser);

    jest
      .spyOn(service, 'fetchUserWithId')
      .mockResolvedValueOnce(mockUser as User);

    const result = await service.getUserById(userId, signedInUser);

    expect(result).toEqual(expectedDto);
  });

  it('should throw an exception for invalid user ID', async () => {
    const userId = 999;
    const signedInUser = { id: userId, role: 2, email: 'test@example.com' };

    jest.spyOn(service, 'fetchUserWithId').mockResolvedValueOnce(null);

    await expect(
      service.getUserById(userId, signedInUser),
    ).rejects.toThrowError(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should return user details for admin role', async () => {
    const userId = 2;
    const adminId = 1;
    const signedInUser = { id: adminId, role: 2, email: 'test@example.com' };
    const mockUser = {
      id: userId,
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
    } as User;
    const expectedDto = new GetUserDto(mockUser);

    jest
      .spyOn(service, 'fetchUserWithId')
      .mockResolvedValueOnce(mockUser as User);

    const result = await service.getUserById(userId, signedInUser);

    expect(result).toEqual(expectedDto);
  });
});
