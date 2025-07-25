// src/infrastructure/persistence/in-memory/data.ts
import { Empresa} from '../../../core/domain/empresa.entity';
import { EmpresaTipo } from '../../../core/domain/empresa-tipo.enum';
import { Transferencia }
 from '../../../core/domain/transferencia.entity';

/**
 * Función auxiliar para obtener una fecha relativa a la fecha actual (simulada para consistencia).
 * La fecha base se establece en 23 de Julio de 2025 para que puedas probar con confianza
 * qué elementos caen en el "último mes" desde esa fecha.
 * @param daysAgo Número de días hacia atrás desde la fecha base.
 * @returns Un objeto Date.
 */
const getRelativeDate = (daysAgo: number): Date => {
  // Establecemos una fecha "hoy" fija para la simulación y pruebas.
  // En un entorno real, simplemente usarías new Date() sin parámetros.
  const date = new Date('2025-07-23T12:00:00.000Z'); // 23 de Julio de 2025 (mediodía UTC)
  date.setDate(date.getDate() - daysAgo);
  return date;
};


export const MOCKED_EMPRESAS: Empresa[] = [
  {
    id: 'emp1',
    cuit: '20-12345678-9',
    razonSocial: 'Empresa Antigüa S.A.',
    fechaAdhesion: getRelativeDate(90), // Hace 90 días (fuera del último mes)
    tipo: EmpresaTipo.CORPORATIVA
  },
  {
    id: 'emp2',
    cuit: '27-98765432-1',
    razonSocial: 'Pyme Innovadora SRL',
    fechaAdhesion: getRelativeDate(15), // Hace 15 días (ADHERIDA EN EL ÚLTIMO MES)
    tipo: EmpresaTipo.PYME
  },
  {
    id: 'emp3',
    cuit: '30-11223344-5',
    razonSocial: 'Corporativa Del Sur',
    fechaAdhesion: getRelativeDate(5), // Hace 5 días (ADHERIDA EN EL ÚLTIMO MES)
    tipo: EmpresaTipo.CORPORATIVA
  },
  {
    id: 'emp4',
    cuit: '33-44556677-8',
    razonSocial: 'Comercio Local Limitada',
    fechaAdhesion: getRelativeDate(60), // Hace 60 días (fuera del último mes)
    tipo: EmpresaTipo.PYME
  },
  {
    id: 'emp5',
    cuit: '34-55667788-9',
    razonSocial: 'Exportaciones Globales S.A.',
    fechaAdhesion: getRelativeDate(35), // Hace 35 días (fuera del último mes)
    tipo: EmpresaTipo.CORPORATIVA
  },
];

export const MOCKED_TRANSFERENCIAS: Transferencia[] = [
  {
    id: 'trans1',
    idEmpresa: 'emp1', // Empresa Antigüa
    importe: 1000.00,
    cuentaDebito: '001-DB-001',
    cuentaCredito: '001-CR-001',
    fecha: getRelativeDate(40) // Hace 40 días (FUERA DEL ÚLTIMO MES)
  },
  {
    id: 'trans2',
    idEmpresa: 'emp2', // Pyme Innovadora
    importe: 500.50,
    cuentaDebito: '002-DB-002',
    cuentaCredito: '002-CR-002',
    fecha: getRelativeDate(10) // Hace 10 días (EN EL ÚLTIMO MES)
  },
  {
    id: 'trans3',
    idEmpresa: 'emp1', // Empresa Antigüa
    importe: 200.75,
    cuentaDebito: '001-DB-003',
    cuentaCredito: '001-CR-003',
    fecha: getRelativeDate(2) // Hace 2 días (EN EL ÚLTIMO MES)
  },
  {
    id: 'trans4',
    idEmpresa: 'emp4', // Comercio Local
    importe: 1500.00,
    cuentaDebito: '004-DB-004',
    cuentaCredito: '004-CR-004',
    fecha: getRelativeDate(70) // Hace 70 días (FUERA DEL ÚLTIMO MES)
  },
  {
    id: 'trans5',
    idEmpresa: 'emp3', // Corporativa Del Sur
    importe: 750.00,
    cuentaDebito: '003-DB-005',
    cuentaCredito: '003-CR-005',
    fecha: getRelativeDate(20) // Hace 20 días (EN EL ÚLTIMO MES)
  },
  {
    id: 'trans6',
    idEmpresa: 'emp2', // Pyme Innovadora
    importe: 300.20,
    cuentaDebito: '002-DB-006',
    cuentaCredito: '002-CR-006',
    fecha: getRelativeDate(25) // Hace 25 días (EN EL ÚLTIMO MES)
  },
];