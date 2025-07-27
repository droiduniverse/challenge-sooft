import { Controller, Get, Post, Body, Inject, UseGuards } from '@nestjs/common';
import { EmpresaServicePort, RegistrarEmpresaCommand } from '../../../core/ports/in/empresa-service.port';
import { Empresa } from '../../../core/domain/empresa.entity';
import { CreateEmpresaDto } from '../dtos/create-empresa.dto';
import { EMPRESA_SERVICE_PORT } from '../../../core/services/empresa.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard'; 
import { ApiBearerAuth } from '@nestjs/swagger'; 


@Controller('empresas')
export class EmpresaController {
  constructor(
    @Inject(EMPRESA_SERVICE_PORT)
    private readonly empresaService: EmpresaServicePort,
  ) {}

  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth() 

  @Get('transferencias-ultimo-mes')
  async getEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]> {
    return this.empresaService.getEmpresasConTransferenciasUltimoMes();
  }

  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth() 
  
  @Get('adheridas-ultimo-mes')
  async getEmpresasAdheridasUltimoMes(): Promise<Empresa[]> {
    return this.empresaService.getEmpresasAdheridasUltimoMes();
  }

  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth() 

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