// src/auth/local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Este guardia usará la estrategia 'local' de Passport.js
// La estrategia 'local' es para validar usuario y contraseña.
// Si no quieres implementar la estrategia 'local' completa, puedes omitir este archivo
// y manejar la validación de usuario directamente en el AuthController como en el ejemplo.
export class LocalAuthGuard extends AuthGuard('local') {}
