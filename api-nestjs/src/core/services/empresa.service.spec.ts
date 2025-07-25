// src/core/services/empresa.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService, EMPRESA_REPOSITORY_PORT, TRANSFERENCIA_REPOSITORY_PORT } from './empresa.service'; // Asegúrate de que las rutas sean correctas
import { EmpresaRepositoryPort } from '../ports/out/empresa-repository.port';
import { TransferenciaRepositoryPort } from '../ports/out/transferencia-repository.port';
import { Empresa} from '../domain/empresa.entity'; // Asegúrate de que las rutas sean correctas
import { EmpresaTipo } from '../domain/empresa-tipo.enum'; 
import { Transferencia } from '../domain/transferencia.entity'; // Asegúrate de que las rutas sean correctas

describe('EmpresaService', () => {
  let service: EmpresaService;
  let mockEmpresaRepository: jest.Mocked<EmpresaRepositoryPort>;
  let mockTransferenciaRepository: jest.Mocked<TransferenciaRepositoryPort>;

  // Datos mockeados para las pruebas
  const MOCKED_EMPRESAS_DATA: Empresa[] = [
    { id: 'e1', cuit: '20-11111111-1', razonSocial: 'Empresa Vieja', fechaAdhesion: new Date('2025-01-01'), tipo: EmpresaTipo.PYME },
    { id: 'e2', cuit: '20-22222222-2', razonSocial: 'Empresa Reciente', fechaAdhesion: new Date('2025-07-01'), tipo: EmpresaTipo.CORPORATIVA }, // Adherida en el último mes
    { id: 'e3', cuit: '20-33333333-3', razonSocial: 'Empresa Con Transferencia', fechaAdhesion: new Date('2025-06-01'), tipo: EmpresaTipo.PYME },
    { id: 'e4', cuit: '20-44444444-4', razonSocial: 'Empresa Solo Adherida', fechaAdhesion: new Date('2025-07-15'), tipo: EmpresaTipo.PYME }, // Adherida en el último mes
  ];

  const MOCKED_TRANSFERENCIAS_DATA: Transferencia[] = [
    { id: 't1', idEmpresa: 'e1', importe: 100, fecha: new Date('2025-06-15'), cuentaDebito: 'c1', cuentaCredito: 'c2' }, // Fuera del último mes
    { id: 't2', idEmpresa: 'e3', importe: 200, fecha: new Date('2025-07-05'), cuentaDebito: 'c3', cuentaCredito: 'c4' }, // En el último mes (Julio)
    { id: 't3', idEmpresa: 'e2', importe: 300, fecha: new Date('2025-07-20'), cuentaDebito: 'c5', cuentaCredito: 'c6' }, // En el último mes (Julio)
    { id: 't4', idEmpresa: 'e1', importe: 50, fecha: new Date('2025-07-22'), cuentaDebito: 'c7', cuentaCredito: 'c8' }, // En el último mes (Julio)
  ];

  beforeEach(async () => {
    // Definimos los mocks de los repositorios
    mockEmpresaRepository = {
      findAll: jest.fn().mockResolvedValue(MOCKED_EMPRESAS_DATA),
      findByFechaAdhesionBetween: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockTransferenciaRepository = {
      findAll: jest.fn().mockResolvedValue(MOCKED_TRANSFERENCIAS_DATA),
      findByEmpresaIdAndFechaBetween: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: EMPRESA_REPOSITORY_PORT,
          useValue: mockEmpresaRepository,
        },
        {
          provide: TRANSFERENCIA_REPOSITORY_PORT,
          useValue: mockTransferenciaRepository,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEmpresasConTransferenciasUltimoMes', () => {
    // Para estas pruebas, la fecha "hoy" es '2025-07-23' (23 de Julio de 2025)
    // El "último mes" va desde '2025-06-23' hasta '2025-07-23'

    it('should return companies with transfers in the last month', async () => {
      // Act
      const result = await service.getEmpresasConTransferenciasUltimoMes();

      // Assert
      expect(mockEmpresaRepository.findAll).toHaveBeenCalled();
      expect(mockTransferenciaRepository.findAll).toHaveBeenCalled();

      // Empresas e2, e3, e1 tienen transferencias en el último mes
      // t2 (e3): 2025-07-05
      // t3 (e2): 2025-07-20
      // t4 (e1): 2025-07-22
      expect(result.length).toBe(3);
      expect(result.map(e => e.id)).toEqual(expect.arrayContaining(['e1', 'e2', 'e3']));
    });

    it('should return an empty array if no transfers in the last month', async () => {
      // Mockear que no hay transferencias en el último mes
      mockTransferenciaRepository.findAll.mockResolvedValueOnce([
        { id: 't5', idEmpresa: 'e1', importe: 100, fecha: new Date('2025-05-01'), cuentaDebito: 'c9', cuentaCredito: 'c10' },
      ]);

      const result = await service.getEmpresasConTransferenciasUltimoMes();
      expect(result).toEqual([]);
    });

    it('should handle cases where some transfers are old', async () => {
      // MOCKED_TRANSFERENCIAS_DATA ya tiene t1 fuera de rango
      const result = await service.getEmpresasConTransferenciasUltimoMes();
      expect(result.length).toBe(3); // e1, e2, e3
    });
  });

  describe('getEmpresasAdheridasUltimoMes', () => {
    // El "último mes" va desde '2025-06-23' hasta '2025-07-23'
    it('should return companies adhered in the last month', async () => {
      // Mockear el método findByFechaAdhesionBetween para que devuelva las correctas
      mockEmpresaRepository.findByFechaAdhesionBetween.mockImplementation(async (start, end) => {
        return MOCKED_EMPRESAS_DATA.filter(emp => emp.fechaAdhesion >= start && emp.fechaAdhesion <= end);
      });

      // Act
      const result = await service.getEmpresasAdheridasUltimoMes();

      // Assert
      expect(mockEmpresaRepository.findByFechaAdhesionBetween).toHaveBeenCalled();
      // Esperamos e2 (2025-07-01) y e4 (2025-07-15)
      expect(result.length).toBe(2);
      expect(result.map(e => e.id)).toEqual(expect.arrayContaining(['e2', 'e4']));
    });

    it('should return an empty array if no companies adhered in the last month', async () => {
      // Mockear para que no haya empresas en el rango
      mockEmpresaRepository.findByFechaAdhesionBetween.mockResolvedValueOnce([]);

      const result = await service.getEmpresasAdheridasUltimoMes();
      expect(result).toEqual([]);
    });
  });

  describe('registrarNuevaEmpresa', () => {
    it('should register a new company and assign an ID and current date', async () => {
      const command = {
        cuit: '30-99999999-9',
        razonSocial: 'Nueva Empresa de Prueba',
        tipo: EmpresaTipo.PYME,
      };

      // Mockear la implementación de save para que simule la asignación de ID
      mockEmpresaRepository.save.mockImplementation(async (empresa) => {
        empresa.id = 'new-generated-id'; // Simular ID generado
        return empresa;
      });

      const result = await service.registrarNuevaEmpresa(command);

      expect(mockEmpresaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          cuit: command.cuit,
          razonSocial: command.razonSocial,
          tipo: command.tipo,
          id: expect.any(String), // Esperamos que se asigne un ID
          fechaAdhesion: expect.any(Date), // Esperamos que se asigne una fecha
        })
      );
      expect(result.id).toBe('new-generated-id');
      expect(result.cuit).toBe(command.cuit);
    });
  });
});