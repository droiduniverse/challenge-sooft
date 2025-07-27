const { handler } = require('./dist/handler');
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// --- Mocks de Módulos ---
// Importante: Para los módulos que necesitan ser rastreados (como uuid y los de AWS SDK),
// definimos los mocks *dentro* de las fábricas de jest.mock.

jest.mock('uuid', () => {
  // Creamos el mock de v4 aquí mismo.
  const mockV4 = jest.fn(() => 'mocked-uuid-123');
  return {
    v4: mockV4,
    __esModule: true,
    _mockV4: mockV4, 
  };
});

jest.mock('class-transformer', () => {
  const actualClassTransformer = jest.requireActual('class-transformer');
  const mockPlainToInstance = jest.fn((cls, plainObject) => {
    if (typeof cls === 'function' && plainObject !== null && typeof plainObject === 'object') {
      const instance = new cls();
      Object.assign(instance, plainObject);
      return instance;
    }
    return plainObject;
  });
  return {
    ...actualClassTransformer,
    plainToInstance: mockPlainToInstance,
    _mockPlainToInstance: mockPlainToInstance, 
  };
});


// ¡ATENCIÓN! NO mockeamos class-validator, quiero que la implementación real se ejecute.


jest.mock('@aws-sdk/lib-dynamodb', () => {
  const _mockPutCommand = jest.fn();
  const _mockSend = jest.fn();

  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: _mockSend, 
      })),
    },
    PutCommand: jest.fn((params) => {
      _mockPutCommand(params); 
      return params;
    }),
    _mockPutCommand: _mockPutCommand,
    _mockSend: _mockSend,
  };
});


describe('Lambda Handler: Adhesión de Empresa (TypeScript compilado)', () => {
  const { _mockV4 } = require('uuid');
  const { _mockPlainToInstance } = require('class-transformer');
  const { _mockPutCommand, _mockSend } = require('@aws-sdk/lib-dynamodb');


  const mockEvent = (body, method = 'POST') => ({
    httpMethod: method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

  beforeEach(() => {
    // Limpieza de mocks
    _mockV4.mockClear();
    _mockPlainToInstance.mockClear();
    _mockPutCommand.mockClear();
    _mockSend.mockClear().mockResolvedValue({}); // mockeada la rta de DynamoDB como exitosa
    consoleErrorSpy.mockClear();

    const MOCK_DATE = new Date('2025-07-25T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => MOCK_DATE);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  // Test Case 1: Solicitud de adhesión exitosa
  it('should successfully register a company with valid data and return 201', async () => {
    const requestBody = {
      cuit: '30-12345678-0',
      razonSocial: 'Empresa Test SA',
      tipo: 'PYME',
    };
    const event = mockEvent(requestBody);

    const response = await handler(event);

    expect(_mockPlainToInstance).toHaveBeenCalledWith(
      expect.any(Function),
      requestBody
    );

    expect(_mockV4).toHaveBeenCalled();

    expect(_mockPutCommand).toHaveBeenCalledWith({
      TableName: 'EmpresasTable',
      Item: {
        id: 'mocked-uuid-123',
        cuit: requestBody.cuit,
        razonSocial: requestBody.razonSocial,
        fechaAdhesion: new Date().toISOString(),
        tipo: requestBody.tipo,
      },
    });
    expect(_mockSend).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      id: 'mocked-uuid-123',
      cuit: requestBody.cuit,
      razonSocial: requestBody.razonSocial,
      fechaAdhesion: new Date().toISOString(),
      tipo: requestBody.tipo,
    });
    expect(response.headers['Content-Type']).toBe('application/json');
  });

  // Test Case 2: Método HTTP no permitido
  it('should return 405 for non-POST methods', async () => {
    const event = mockEvent({ cuit: 'test' }, 'GET');

    const response = await handler(event);

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toEqual({ message: 'Method Not Allowed' });
    expect(_mockSend).not.toHaveBeenCalled();
  });

  // Test Case 3: Errores de validación
  it('should return 400 for invalid request body (validation errors)', async () => {
    const invalidRequestBody = {
      cuit: '',
      razonSocial: 'Invalid Company',
      tipo: 'INVALID_TYPE',
    };
    const event = mockEvent(invalidRequestBody);

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Bad Request');
    expect(body.statusCode).toBe(400);
    expect(body.message).toEqual(
      expect.arrayContaining([
        'El CUIT no puede estar vacío.',
        'El tipo de empresa no es válido.',
      ])
    );
    expect(_mockSend).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // Test Case 4: Request body no es un JSON válido
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
    expect(_mockSend).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // Test Case 5: Error durante la operación de DynamoDB
  it('should return 500 if DynamoDB operation fails', async () => {
    const requestBody = {
      cuit: '30-98765432-1',
      razonSocial: 'Failing Company',
      tipo: 'CORPORATIVA',
    };
    const event = mockEvent(requestBody);

    _mockSend.mockRejectedValueOnce(new Error('DynamoDB connection failed'));

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Internal Server Error');
    expect(JSON.parse(response.body).error).toBe('DynamoDB connection failed');
    expect(_mockSend).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});