import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
// Desde controllers/ a core/ports/in/
import { EmpresaServicePort, RegistrarEmpresaCommand } from '../../../core/ports/in/empresa-service.port';
// Desde controllers/ a core/domain/
import { Empresa } from '../../../core/domain/empresa.entity';
// Desde controllers/ a dtos/
import { CreateEmpresaDto } from '../dtos/create-empresa.dto';
// Desde controllers/ a core/services/
import { EMPRESA_SERVICE_PORT } from '../../../core/services/empresa.service';

@Controller('empresas')
export class EmpresaController {
  constructor(
    @Inject(EMPRESA_SERVICE_PORT)
    private readonly empresaService: EmpresaServicePort,
  ) {}

  @Get('transferencias-ultimo-mes')
  async getEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]> {
    return this.empresaService.getEmpresasConTransferenciasUltimoMes();
  }

  @Get('adheridas-ultimo-mes')
  async getEmpresasAdheridasUltimoMes(): Promise<Empresa[]> {
    return this.empresaService.getEmpresasAdheridasUltimoMes();
  }

  @Post('adhesion')
  async registrarAdhesion(@Body() createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const command: RegistrarEmpresaCommand = {
      cuit: createEmpresaDto.cuit,
      razonSocial: createEmpresaDto.razonSocial,
      tipo: createEmpresaDto.tipo,
    };
    return this.empresaService.registrarNuevaEmpresa(command);
  }
}