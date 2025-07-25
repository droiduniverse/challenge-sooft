import { Transferencia } from '../../domain/transferencia.entity';

export interface TransferenciaRepositoryPort {
  findByEmpresaIdAndFechaBetween(empresaId: string, start: Date, end: Date): Promise<Transferencia[]>;
  findAll(): Promise<Transferencia[]>;
  save(transferencia: Transferencia): Promise<Transferencia>;
}