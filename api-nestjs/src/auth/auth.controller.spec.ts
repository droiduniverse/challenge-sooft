import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  // Mock del AuthService
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Habilitamos el ValidationPipe para probar las validaciones de LoginDto
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterEach(() => {
    // Reseteamos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /auth/login', () => {
    const loginDto: LoginDto = { username: 'testuser', password: 'testpassword' };
    const userPayload = { userId: '1', username: 'testuser', roles: ['user'] };
    const accessToken = 'mocked_access_token';

    it('should return an access token for valid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(userPayload);
      mockAuthService.login.mockResolvedValue({ access_token: accessToken });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual({ access_token: accessToken });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.username, loginDto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(userPayload);
    });

    it('should return 401 Unauthorized for invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null); // Simula credenciales inválidas

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Credenciales inválidas');
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.username, loginDto.password);
      expect(mockAuthService.login).not.toHaveBeenCalled(); // No se debería llamar al método login
    });

    it('should return 400 Bad Request if username is missing', async () => {
      const invalidDto: Partial<LoginDto> = { password: 'testpassword' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toEqual(expect.arrayContaining(['username should not be empty']));
      expect(mockAuthService.validateUser).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if password is missing', async () => {
      const invalidDto: Partial<LoginDto> = { username: 'testuser' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toEqual(expect.arrayContaining(['password should not be empty']));
      expect(mockAuthService.validateUser).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request if extra properties are sent', async () => {
      const invalidDto: any = { ...loginDto, extra: 'property' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toEqual(expect.arrayContaining(['property extra should not exist']));
      expect(mockAuthService.validateUser).not.toHaveBeenCalled();
    });
  });
});
