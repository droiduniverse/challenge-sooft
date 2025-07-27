// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Extiende AuthGuard con la estrategia 'jwt' para proteger las rutas
export class JwtAuthGuard extends AuthGuard('jwt') {}
