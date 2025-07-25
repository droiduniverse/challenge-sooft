import { Transferencia } from '../../domain/transferencia.entity';

// Si tuvieras un caso de uso para registrar transferencias directamente
export interface RegistrarTransferenciaCommand {
  idEmpresa: string;
  importe: number;
  cuentaDebito: string;
  cuentaCredito: string;
  // La fecha podría ser implícitamente Date() al momento de registro
}

/**
 * Define la interfaz del servicio de dominio de Transferencias.
 * Es un "Puerto de Entrada" (Inbound Port) para la lógica de negocio relacionada con transferencias.
 * Por ahora, los requerimientos se enfocan más en reportes a través de EmpresaService,
 * pero esta interfaz es un placeholder si la complejidad aumenta.
 */
export interface TransferenciaServicePort {
  // Ejemplo de un método que podrías añadir si necesitaras registrar transferencias
  // registrarTransferencia(command: RegistrarTransferenciaCommand): Promise<Transferencia>;

  // Ejemplo de un método para obtener transferencias directamente (no requerido en el challenge inicial)
  // getTransferenciasByEmpresaId(empresaId: string): Promise<Transferencia[]>;
}