import { Injectable } from '@nestjs/common';
// Desde in-memory/ a core/ports/out/
import { EmpresaRepositoryPort } from '../../../core/ports/out/empresa-repository.port';
// Desde in-memory/ a core/domain/
import { Empresa } from '../../../core/domain/empresa.entity';
// Desde in-memory/ a data.ts (mismo nivel)
import { MOCKED_EMPRESAS } from './data';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryEmpresaRepository implements EmpresaRepositoryPort {
  private empresas: Empresa[] = [...MOCKED_EMPRESAS];

  async findById(id: string): Promise<Empresa | null> {
    return this.empresas.find(e => e.id === id) || null;
  }

  async save(empresa: Empresa): Promise<Empresa> {
    if (!empresa.id) {
      empresa.id = uuidv4();
    }
    const existingIndex = this.empresas.findIndex(e => e.id === empresa.id);
    if (existingIndex !== -1) {
      this.empresas[existingIndex] = empresa;
    } else {
      this.empresas.push(empresa);
    }
    return empresa;
  }

  async findAll(): Promise<Empresa[]> {
    return [...this.empresas];
  }

  async findByFechaAdhesionBetween(start: Date, end: Date): Promise<Empresa[]> {
    return this.empresas.filter(empresa =>
      empresa.fechaAdhesion >= start && empresa.fechaAdhesion <= end
    );
  }
}