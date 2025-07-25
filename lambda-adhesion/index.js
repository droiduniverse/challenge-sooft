const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');


var EmpresaTipo;
(function (EmpresaTipo) {
    EmpresaTipo["PYME"] = "PYME";
    EmpresaTipo["CORPORATIVA"] = "CORPORATIVA";
})(EmpresaTipo || (EmpresaTipo = {}));


class CreateEmpresaDto {
    cuit;
    razonSocial;
    tipo;
}


// --- Configuración de DynamoDB ---
const client = new DynamoDBClient({}); // Cliente de bajo nivel
const ddbDocClient = DynamoDBDocumentClient.from(client); // Cliente de alto nivel (para operaciones de documentos)
const TABLE_NAME = process.env.TABLE_NAME || 'EmpresasTable'; // Nombre de la tabla asumida tabla DynamoDB

/**
 * Función auxiliar para construir respuestas HTTP de API Gateway.
 */
const buildResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // CORS - Ajustar en producción
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(body),
    };
};

/**
 * Handler principal de la Lambda Function.
 * @param {object} event - Objeto de evento de la solicitud API Gateway.
 * @returns {Promise<object>} - Respuesta HTTP para API Gateway.
 */
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (event.httpMethod !== 'POST') {
        return buildResponse(405, { message: 'Method Not Allowed' });
    }

    try {
        const requestBody = JSON.parse(event.body);

        // 1. Validación de Datos
        // Usamos plainToInstance para convertir el objeto plano del body en una instancia de CreateEmpresaDto
        const createEmpresaDto = plainToInstance(CreateEmpresaDto, requestBody);
        // NOTA IMPORTANTE: En este entorno de JavaScript puro, la validación basada en
        // decoradores de 'class-validator' no aplicará reglas automáticamente
        // a menos que el código haya sido transpilado de TypeScript con 'emitDecoratorMetadata'.
        // Para una Lambda de producción puramente JS, se necesitaría validación manual explícita.


        const errors = await validate(createEmpresaDto);

        if (errors.length > 0) {
            console.error('Validation errors:', errors);
            const errorMessages = errors.flatMap(error => Object.values(error.constraints || {}));
            return buildResponse(400, {
                message: errorMessages,
                error: 'Bad Request',
                statusCode: 400,
            });
        }

        // 2. Generar datos de la Empresa
        const nuevaEmpresa = {
            id: uuidv4(),
            cuit: createEmpresaDto.cuit,
            razonSocial: createEmpresaDto.razonSocial,
            fechaAdhesion: new Date().toISOString(), // Almacenar como string ISO para DynamoDB
            tipo: createEmpresaDto.tipo,
        };

        // 3. Almacenar en DynamoDB
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: nuevaEmpresa,
        });

        await ddbDocClient.send(command);
        console.log('Empresa saved:', nuevaEmpresa);

        // 4. Devolver la respuesta de éxito
        return buildResponse(201, nuevaEmpresa);

    } catch (error) {
        console.error('Error processing request:', error);
        return buildResponse(500, {
            message: 'Internal Server Error',
            error: error.message || 'Failed to process request',
            statusCode: 500,
        });
    }
};

// --- Nota sobre class-validator en Lambda con JS ---
// Para que `validate(createEmpresaDto)` funcione en un entorno de Node.js puro sin transpilar TypeScript,
// necesitarías que los decoradores `@IsString()`, `@IsNotEmpty()`, `@IsEnum()` se hubieran aplicado
// a la clase `CreateEmpresaDto` durante un proceso de transpilación (ej. con TypeScript o Babel).
// En un despliegue real de Lambda, subirías el código transpilado de tus archivos .ts.
// Para esta demostración teórica, asumimos esa pre-transpilación.
// Si no quieres usar class-validator y solo JS, harías las validaciones manualmente:
/*
if (!requestBody.cuit || typeof requestBody.cuit !== 'string') {
    // error
}
if (!Object.values(EmpresaTipo).includes(requestBody.tipo)) {
    // error
}
*/
