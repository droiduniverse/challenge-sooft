export interface Transferencia {
  id: string;
  idEmpresa: string;
  importe: number;
  cuentaDebito: string;
  cuentaCredito: string;
  fecha: Date;
}