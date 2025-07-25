// src/app.module.ts
import { Module } from '@nestjs/common';
// Desde src/ a infrastructure/api/controllers/
import { EmpresaController } from './infrastructure/api/controllers/empresa.controller';

// Desde src/ a core/services/
import {
  EmpresaService,
  EMPRESA_SERVICE_PORT,
  EMPRESA_REPOSITORY_PORT,
  TRANSFERENCIA_REPOSITORY_PORT,
} from './core/services/empresa.service';

// Desde src/ a infrastructure/persistence/in-memory/
import { InMemoryEmpresaRepository } from './infrastructure/persistence/in-memory/in-memory-empresa.repository';
// Desde src/ a infrastructure/persistence/in-memory/
import { InMemoryTransferenciaRepository } from './infrastructure/persistence/in-memory/in-memory-transferencia.repository';

@Module({
  imports: [],
  controllers: [EmpresaController],
  providers: [
    {
      provide: EMPRESA_SERVICE_PORT,
      useClass: EmpresaService,
    },
    {
      provide: EMPRESA_REPOSITORY_PORT,
      useClass: InMemoryEmpresaRepository,
    },
    {
      provide: TRANSFERENCIA_REPOSITORY_PORT,
      useClass: InMemoryTransferenciaRepository,
    },
  ],
})
export class AppModule {}