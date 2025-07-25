import { EmpresaTipo } from './empresa-tipo.enum';

export interface Empresa {
  id: string;
  cuit: string;
  razonSocial: string;
  fechaAdhesion: Date;
  tipo: EmpresaTipo;
}