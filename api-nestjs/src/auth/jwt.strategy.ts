// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Para leer variables de entorno

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrae el JWT del encabezado 'Authorization' como un token Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ignora si el token ha expirado (false significa que Passport lo verificará)
      ignoreExpiration: false,
      // La clave secreta para verificar la firma del token. Debe ser la misma que se usó para firmar.
      secretOrKey: configService.get<string>('JWT_SECRET', 'superSecretKey'), // Usa la misma clave por defecto
    });
  }

  /**
   * Método de validación de la estrategia JWT.
   * Se ejecuta después de que el token ha sido extraído y verificado.
   * @param payload El payload decodificado del JWT.
   * @returns El objeto de usuario que se adjuntará al objeto `request`.
   */
  async validate(payload: any) {
    // Aquí podrías buscar el usuario en una base de datos real para asegurar que sigue existiendo
    // y para cargar información adicional si fuera necesario.
    // Para este desafío, simplemente devolvemos el payload del token.
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }
}
