import { Injectable } from '@nestjs/common';
// Desde in-memory/ a core/ports/out/
import { TransferenciaRepositoryPort } from '../../../core/ports/out/transferencia-repository.port';
// Desde in-memory/ a core/domain/
import { Transferencia } from '../../../core/domain/transferencia.entity';
// Desde in-memory/ a data.ts (mismo nivel)
import { MOCKED_TRANSFERENCIAS } from './data';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryTransferenciaRepository implements TransferenciaRepositoryPort {
  private transferencias: Transferencia[] = [...MOCKED_TRANSFERENCIAS];

  async findByEmpresaIdAndFechaBetween(empresaId: string, start: Date, end: Date): Promise<Transferencia[]> {
    return this.transferencias.filter(transferencia =>
      transferencia.idEmpresa === empresaId &&
      transferencia.fecha >= start &&
      transferencia.fecha <= end
    );
  }

  async findAll(): Promise<Transferencia[]> {
    return [...this.transferencias];
  }

  async save(transferencia: Transferencia): Promise<Transferencia> {
    if (!transferencia.id) {
      transferencia.id = uuidv4();
    }
    const existingIndex = this.transferencias.findIndex(t => t.id === transferencia.id);
    if (existingIndex !== -1) {
      this.transferencias[existingIndex] = transferencia;
    } else {
      this.transferencias.push(transferencia);
    }
    return transferencia;
  }
}