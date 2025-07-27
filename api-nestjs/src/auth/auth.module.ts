// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';       
import { JwtStrategy } from './jwt.strategy'; 
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa ConfigModule para acceder a las variables de entorno

@Module({
  imports: [
    // Configura Passport para usar la estrategia por defecto 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Configura el módulo JWT para firmar y verificar tokens
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule para usar ConfigService
      useFactory: async (configService: ConfigService) => ({
        // La clave secreta para firmar los tokens. Idealmente, debería ser una variable de entorno.
        secret: configService.get<string>('JWT_SECRET', 'superSecretKey'), // Usa una clave por defecto si no está en .env
        // Opciones para la firma del token (ej. tiempo de expiración)
        signOptions: { expiresIn: '60m' }, // Token expira en 60 minutos
      }),
      inject: [ConfigService], // Inyecta ConfigService en useFactory
    }),
    ConfigModule, // Asegúrate de importar ConfigModule aquí también
  ],
  providers: [AuthService, JwtStrategy], // Registra el servicio de autenticación y la estrategia JWT
  controllers: [AuthController], // Registra el controlador de autenticación
  exports: [AuthService, JwtModule, PassportModule], // Exporta para que otros módulos puedan usar JWT y Passport
})
export class AuthModule {}
