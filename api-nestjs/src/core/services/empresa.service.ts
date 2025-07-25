import { Injectable, Inject } from '@nestjs/common';
// Desde services/ a ports/in/
import { EmpresaServicePort, RegistrarEmpresaCommand } from '../ports/in/empresa-service.port';
// Desde services/ a ports/out/
import { EmpresaRepositoryPort } from '../ports/out/empresa-repository.port';
// Desde services/ a ports/out/
import { TransferenciaRepositoryPort } from '../ports/out/transferencia-repository.port';
// Desde services/ a domain/
import { Empresa } from '../domain/empresa.entity';

// --- DEFINICIÓN DE LOS TOKENS DE INYECCIÓN ---
export const EMPRESA_SERVICE_PORT = Symbol('EMPRESA_SERVICE_PORT');
export const EMPRESA_REPOSITORY_PORT = Symbol('EMPRESA_REPOSITORY_PORT');
export const TRANSFERENCIA_REPOSITORY_PORT = Symbol('TRANSFERENCIA_REPOSITORY_PORT');
// ---------------------------------------------

@Injectable()
export class EmpresaService implements EmpresaServicePort {
  constructor(
    @Inject(EMPRESA_REPOSITORY_PORT)
    private readonly empresaRepository: EmpresaRepositoryPort,
    @Inject(TRANSFERENCIA_REPOSITORY_PORT)
    private readonly transferenciaRepository: TransferenciaRepositoryPort,
  ) {}

  async getEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]> {
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    const hoy = new Date();

    const todasEmpresas = await this.empresaRepository.findAll();
    const todasTransferencias = await this.transferenciaRepository.findAll();

    const empresasConTransferenciasIds = new Set<string>();

    todasTransferencias.forEach(transferencia => {
      if (transferencia.fecha >= unMesAtras && transferencia.fecha <= hoy) {
        empresasConTransferenciasIds.add(transferencia.idEmpresa);
      }
    });

    return todasEmpresas.filter(empresa =>
      empresasConTransferenciasIds.has(empresa.id)
    );
  }

  async getEmpresasAdheridasUltimoMes(): Promise<Empresa[]> {
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    const hoy = new Date();

    return this.empresaRepository.findByFechaAdhesionBetween(unMesAtras, hoy);
  }

  async registrarNuevaEmpresa(command: RegistrarEmpresaCommand): Promise<Empresa> {
    const nuevaEmpresa: Empresa = {
      id: '',
      cuit: command.cuit,
      razonSocial: command.razonSocial,
      fechaAdhesion: new Date(),
      tipo: command.tipo,
    };
    return this.empresaRepository.save(nuevaEmpresa);
  }
}