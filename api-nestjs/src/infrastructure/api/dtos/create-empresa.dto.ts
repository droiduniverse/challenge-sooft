import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 
import { EmpresaTipo } from './../../../core/domain/empresa-tipo.enum'; 

export class CreateEmpresaDto {
  @ApiProperty({
    description: 'CUIT de la empresa',
    example: '20-12345678-9',
    type: String, 
  })
  @IsNotEmpty()
  @IsString()
  cuit: string;

  @ApiProperty({
    description: 'Razón Social de la empresa',
    example: 'Mi Empresa S.A.',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  razonSocial: string;

  @ApiProperty({
    description: 'Tipo de empresa (PYME o CORPORATIVA)',
    enum: EmpresaTipo,
    example: EmpresaTipo.PYME,
  })
  @IsNotEmpty()
  @IsEnum(EmpresaTipo)
  tipo: EmpresaTipo;
}
