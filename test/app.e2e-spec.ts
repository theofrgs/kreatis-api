import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateNativeRegisterDTO } from '@src/auth/dto/create-auth.dto';
import { CreateNativeCredentialDTO } from '@src/native-credential/dto/create-native-credential.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Authentification', () => {
    it('register a native user', async () => {
      const registerDto: CreateNativeRegisterDTO = {
        email: 'user@example.com',
        password: 'user@example.com',
        first_name: 'first_name',
        last_name: 'last_name',
      };
      const response = await request(app.getHttpServer())
        .post('/auth/native/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('access_token');
    });

    it('register same user', async () => {
      const registerDto: CreateNativeRegisterDTO = {
        email: 'user@example.com',
        password: 'user@example.com',
        first_name: 'first_name',
        last_name: 'last_name',
      };
      await request(app.getHttpServer())
        .post('/auth/native/register')
        .send(registerDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('login a native user', async () => {
      const loginDto: CreateNativeCredentialDTO = {
        email: 'user@example.com',
        password: 'user@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/native/login')
        .send(loginDto)
        .expect(HttpStatus.OK);
      expect(response.body).toHaveProperty('access_token');
    });

    it('login a invalid native user', async () => {
      const loginDto: CreateNativeCredentialDTO = {
        email: 'userdeed@example.com',
        password: 'user@example.com',
      };

      await request(app.getHttpServer())
        .post('/auth/native/login')
        .send(loginDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('login a invalid password native user', async () => {
      const loginDto: CreateNativeCredentialDTO = {
        email: 'user@example.com',
        password: 'usdzedeer@example.com',
      };

      await request(app.getHttpServer())
        .post('/auth/native/login')
        .send(loginDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
