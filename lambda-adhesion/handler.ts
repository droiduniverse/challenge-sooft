// handler.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata'; // ¡CRUCIAL! Importar para que los decoradores funcionen con class-validator

// Importamos el DTO y el Enum desde nuestro nuevo archivo
import { CreateEmpresaDto, EmpresaTipo } from './create-empresa.dto';


// --- Configuración de DynamoDB ---
const client = new DynamoDBClient({}); // Cliente de bajo nivel
const ddbDocClient = DynamoDBDocumentClient.from(client); // Cliente de alto nivel (para operaciones de documentos)
const TABLE_NAME = process.env.TABLE_NAME || 'EmpresasTable'; // Nombre de la tabla asumida tabla DynamoDB

/**
 * Función auxiliar para construir respuestas HTTP de API Gateway.
 */
const buildResponse = (statusCode: number, body: any) => { // Añadimos tipos básicos
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
export const handler = async (event: { httpMethod: string; body?: string; }) => { // Añadimos tipos para el evento
    console.log('Received event:', JSON.stringify(event, null, 2));

    if (event.httpMethod !== 'POST') {
        return buildResponse(405, { message: 'Method Not Allowed' });
    }

    try {
        if (!event.body) {
            return buildResponse(400, { message: 'Request body is missing' });
        }
        const requestBody = JSON.parse(event.body);

        // 1. Validación de Datos
        // Usamos plainToInstance para convertir el objeto plano del body en una instancia de CreateEmpresaDto
        // TypeScript aquí ayuda a asegurar que los tipos coincidan.
        const createEmpresaDto = plainToInstance(CreateEmpresaDto, requestBody);

        // validate() encontrará los metadatos de los decoradores gracias a TypeScript y 'reflect-metadata'.
        const errors = await validate(createEmpresaDto);

        if (errors.length > 0) {
            console.error('Validation errors:', errors);
            // Mapeamos los errores para obtener solo los mensajes de las restricciones
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
            fechaAdhesion: new Date().toISOString(), 
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

    } catch (error: any) { 
        console.error('Error processing request:', error);
        return buildResponse(500, {
            message: 'Internal Server Error',
            error: error.message || 'Failed to process request',
            statusCode: 500,
        });
    }
};