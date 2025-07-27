// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // Para simular la verificación de contraseña (opcional para mocks)

// Datos de usuarios mockeados en memoria
// En un entorno real, esto vendría de una base de datos
const MOCKED_USERS = [
  { id: 'user1', username: 'admin', password: 'password123', roles: ['admin'] },
  { id: 'user2', username: 'user', password: 'password456', roles: ['user'] },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Valida las credenciales de un usuario y genera un JWT si son válidas.
   * @param username Nombre de usuario.
   * @param pass Contraseña.
   * @returns Un objeto con el token de acceso o null si las credenciales son inválidas.
   */
  async validateUser(username: string, pass: string): Promise<any> {
    // Busca el usuario en nuestros datos mockeados en memoria
    const user = MOCKED_USERS.find(u => u.username === username);

    if (user) {
      // En un entorno real, se compararía la contraseña hasheada
      // const isMatch = await bcrypt.compare(pass, user.password);
      const isMatch = (pass === user.password); // Para el mock, solo compara directamente

      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user; // Excluye la contraseña del resultado
        return result; // Devuelve el usuario sin la contraseña
      }
    }
    return null; // Credenciales inválidas
  }

  /**
   * Genera un JSON Web Token para un usuario validado.
   * @param user Objeto de usuario (sin la contraseña).
   * @returns Un objeto que contiene el token de acceso.
   */
  async login(user: any) {
    // El payload del token contendrá información que identifique al usuario
    const payload = { username: user.username, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload), // Firma el payload para crear el token
    };
  }
}
