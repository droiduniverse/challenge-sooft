const { handler } = require('./index');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123'),
}));

// class-transformer y class-validator:
// En este entorno de JS puro sin transpilación de TypeScript,
// validate() siempre devolverá un array vacío si no se le inyectan metadatos manualmente.
// plainToInstance simplemente devuelve el objeto si no hay transformadores complejos.
jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn((_cls, obj) => obj),
}));
jest.mock('class-validator', () => ({
  validate: jest.fn(() => Promise.resolve([])), // Simula siempre validación exitosa en este contexto
}));

// AWS SDK DynamoDB DocumentClient
const mockPutCommand = jest.fn();
const mockSend = jest.fn();

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: mockSend,
    })),
  },
  PutCommand: jest.fn((params) => {
    mockPutCommand(params);
    return params;
  }),
}));

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Lambda Handler: Adhesión de Empresa (JS Puro)', () => {
  const mockEvent = (body, method = 'POST') => ({
    httpMethod: method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

  beforeEach(() => {
    require('uuid').v4.mockClear();
    require('class-transformer').plainToInstance.mockClear();
    require('class-validator').validate.mockClear().mockResolvedValue([]); // Asegurar que siempre devuelve []
    mockPutCommand.mockClear();
    mockSend.mockClear().mockResolvedValue({});
    consoleErrorSpy.mockClear();

    const MOCK_DATE = new Date('2025-07-25T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => MOCK_DATE);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  // --- Test Case 1: Solicitud de adhesión exitosa ---
  it('should successfully register a company with valid data and return 201', async () => {
    const requestBody = {
      cuit: '30-12345678-0',
      razonSocial: 'Empresa Test SA',
      tipo: 'PYME',
    };
    const event = mockEvent(requestBody);

    const response = await handler(event);

    expect(require('class-transformer').plainToInstance).toHaveBeenCalledWith(
      expect.any(Function),
      requestBody
    );
    expect(require('class-validator').validate).toHaveBeenCalledWith(requestBody); // Called, but returns [] in this setup

    expect(require('uuid').v4).toHaveBeenCalled();

    expect(mockPutCommand).toHaveBeenCalledWith({
      TableName: 'EmpresasTable',
      Item: {
        id: 'mocked-uuid-123',
        cuit: requestBody.cuit,
        razonSocial: requestBody.razonSocial,
        fechaAdhesion: new Date().toISOString(),
        tipo: requestBody.tipo,
      },
    });
    expect(mockSend).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      id: 'mocked-uuid-123',
      cuit: requestBody.cuit,
      razonSocial: requestBody.razonSocial,
      fechaAdhesion: new Date().toISOString(),
      tipo: requestBody.tipo,
    });
  });

  // --- Test Case 2: Método HTTP no permitido ---
  it('should return 405 for non-POST methods', async () => {
    const event = mockEvent({ cuit: 'test' }, 'GET');

    const response = await handler(event);

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toEqual({ message: 'Method Not Allowed' });
    expect(require('class-validator').validate).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  // --- Test Case 3: Request body no es un JSON válido ---
  it('should return 500 for invalid JSON in request body', async () => {
    const event = {
      httpMethod: 'POST',
      body: '{ "cuit": "abc", "razonSocial": "xyz" ',
      headers: { 'Content-Type': 'application/json' },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Internal Server Error');
    expect(JSON.parse(response.body).error).toContain('Unexpected end of JSON input');
    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // --- Test Case 4: Error durante la operación de DynamoDB ---
  it('should return 500 if DynamoDB operation fails', async () => {
    const requestBody = {
      cuit: '30-98765432-1',
      razonSocial: 'Failing Company',
      tipo: 'CORPORATIVA',
    };
    const event = mockEvent(requestBody);

    mockSend.mockRejectedValueOnce(new Error('DynamoDB connection failed'));

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Internal Server Error');
    expect(JSON.parse(response.body).error).toBe('DynamoDB connection failed');
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});