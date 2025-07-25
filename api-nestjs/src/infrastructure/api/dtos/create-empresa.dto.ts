import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
// Desde dtos/ a core/domain/
import { EmpresaTipo } from '../../../core/domain/empresa-tipo.enum';


export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  cuit: string;

  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsEnum(EmpresaTipo)
  @IsNotEmpty()
  tipo: EmpresaTipo;
}