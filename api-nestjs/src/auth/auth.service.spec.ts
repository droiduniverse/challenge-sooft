// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  // Datos de usuarios mockeados (los mismos que en auth.service.ts)
  const MOCKED_USERS = [
    { id: 'user1', username: 'admin', password: 'password123', roles: ['admin'] },
    { id: 'user2', username: 'user', password: 'password456', roles: ['user'] },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // Mockeamos JwtService ya que AuthService depende de él para firmar tokens
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload) => `mocked_jwt_token_for_${payload.username}`), // Simula la firma del token
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      const user = await service.validateUser('admin', 'password123');
      expect(user).toBeDefined();
      expect(user.id).toBe('user1');
      expect(user.username).toBe('admin');
      expect(user).not.toHaveProperty('password'); // Aseguramos que la contraseña no se devuelva
    });

    it('should return null if username is invalid', async () => {
      const user = await service.validateUser('nonexistent', 'password123');
      expect(user).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = await service.validateUser('admin', 'wrongpassword');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      const userPayload = { id: 'user1', username: 'admin', roles: ['admin'] };
      const result = await service.login(userPayload);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(`mocked_jwt_token_for_${userPayload.username}`);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: userPayload.username,
        sub: userPayload.id,
        roles: userPayload.roles,
      });
    });
  });
});
