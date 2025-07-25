import { Empresa } from '../../domain/empresa.entity';
import { EmpresaTipo } from '../../domain/empresa-tipo.enum';
/**
 * Command para registrar una nueva empresa.
 * Un "Command" es un objeto que encapsula todos los datos
 * necesarios para ejecutar una operación (en este caso, el registro).
 */
export interface RegistrarEmpresaCommand {
  cuit: string;
  razonSocial: string;
  tipo: EmpresaTipo;
}

/**
 * Define la interfaz del servicio de dominio de Empresas.
 * Es un "Puerto de Entrada" (Inbound Port) que la capa de aplicación
 * expone a los adaptadores de entrada (como los controladores HTTP).
 * Contiene los métodos correspondientes a los casos de uso principales.
 */
export interface EmpresaServicePort {
  /**
   * Obtiene una lista de empresas que realizaron transferencias en el último mes.
   * @returns Una promesa que resuelve con un array de objetos Empresa.
   */
  getEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]>;

  /**
   * Obtiene una lista de empresas que se adhirieron en el último mes.
   * @returns Una promesa que resuelve con un array de objetos Empresa.
   */
  getEmpresasAdheridasUltimoMes(): Promise<Empresa[]>;

  /**
   * Registra la adhesión de una nueva empresa (PYME o Corporativa).
   * @param command Los datos para registrar la empresa.
   * @returns Una promesa que resuelve con el objeto Empresa registrado.
   */
  registrarNuevaEmpresa(command: RegistrarEmpresaCommand): Promise<Empresa>;
}