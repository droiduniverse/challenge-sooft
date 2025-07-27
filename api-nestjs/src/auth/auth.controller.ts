// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpCode, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dtos/login.dto'; 
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth') 
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Usamos LocalAuthGuard para la estrategia 'local' (validación de usuario/contraseña)
  // @UseGuards(LocalAuthGuard) // Descomentar si implementas una estrategia 'local' de Passport
  @Post('login')
  @HttpCode(HttpStatus.OK) // Devuelve 200 OK en lugar de 201 Created
  @ApiOperation({ summary: 'Iniciar sesión y obtener un token JWT' })
  @ApiBody({ type: LoginDto, description: 'Credenciales de usuario para iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve el token JWT.', schema: { example: { access_token: 'eyJhbGciOi...' } } })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto) { // Usamos el DTO de login
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }
}
