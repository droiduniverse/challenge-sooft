// create-empresa.dto.ts
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum EmpresaTipo {
  PYME = "PYME",
  CORPORATIVA = "CORPORATIVA",
}

export class CreateEmpresaDto {
  @IsString({ message: 'El CUIT debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El CUIT no puede estar vacío.' })
  cuit!: string;

  @IsString({ message: 'La Razón Social debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La Razón Social no puede estar vacía.' })
  razonSocial!: string;

  @IsEnum(EmpresaTipo, { message: 'El tipo de empresa no es válido.' })
  tipo!: EmpresaTipo;
}