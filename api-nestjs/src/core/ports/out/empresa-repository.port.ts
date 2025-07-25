import { Empresa } from '../../domain/empresa.entity';

export interface EmpresaRepositoryPort {
  findById(id: string): Promise<Empresa | null>;
  save(empresa: Empresa): Promise<Empresa>;
  findAll(): Promise<Empresa[]>;
  findByFechaAdhesionBetween(start: Date, end: Date): Promise<Empresa[]>;
}