import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './shared/utils/validator.pipe';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './shared/guards/auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';

const configService = new ConfigService();
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '1hr' },
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: configService.get<string>('DB_HOST'),
      port: 3306,
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      models: [],
      autoLoadModels: true,
      synchronize: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
