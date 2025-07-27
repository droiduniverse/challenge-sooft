# Desafío Técnico - SOOFT Technology :rocket: 
Hola! Gracias por la oportunidad. Este repositorio contiene la solución completa al desafío técnico propuesto. 

## Visión General
La solución está organizada como un monorepo simple para facilitar la evaluación y mantener la cohesión entre las distintas partes del proyecto.

### Estructura del Repositorio
#### Api nestjs Interbanking

`./api-nestjs/` : Contiene la API REST desarrollada con NestJS, siguiendo una Arquitectura Hexagonal.

`./lambda-adhesion/` : Contiene el diseño teórico y el código fuente de la función AWS Lambda para la adhesión de empresas.

#### 1. API NestJS (/api-nestjs)
Esta carpeta contiene la implementación principal del desafío. Se recomienda usar node 20 

Para ejecutarla:

Navegue a la carpeta de la API:

`cd api-nestjs`

Instale las dependencias:

`npm install`

Inicie la aplicación en modo desarrollo:

`npm run start:dev`

La API estará disponible en `http://localhost:3000`

Acceso a la Documentación de la API:

Una vez que la API esté corriendo, la documentación interactiva (Swagger UI) estará disponible en:
`http://localhost:3000/api/docs`

Para probar los endpoints protegidos, primero obtenga un token JWT desde el endpoint `/auth/login` (credenciales de prueba: admin/password123 o user/password456) y luego úselo en el botón "Authorize" de Swagger.


#### 2. Diseño de AWS Lambda (/lambda-adhesion)

Esta carpeta contiene la parte teórica del desafío. 

## AWS Lambda Function para Adhesión de Empresa (Diseño Teórico)

Esta sección describe el diseño de una AWS Lambda Function para el proceso de adhesión de empresas, como una alternativa serverless al endpoint del backend NestJS.

### Configuración y Código

* **Runtime:** Node.js
* **Base de Datos (simulada):** AWS DynamoDB
* **Trigger (teórico):** AWS API Gateway

El código fuente (`index.js`) y el `package.json` se encuentran en este directorio.

**Nota Importante sobre la Validación y TypeScript**

Este proyecto de Lambda está escrito en TypeScript para propósitos de demostración teórica. Incluye las librerías `class-validator` y `class-transformer` por su relevancia en proyectos de Node.js modernos.

Para que `class-validator` realice validaciones basadas en decoradores (por ejemplo, `@IsString()`, `@IsEnum()`), el código fuente en TypeScript debe pasar por un proceso de transpilación con tsc que inyecte los metadatos de los decoradores `(emitDecoratorMetadata: true)`. **Esta configuración se asume para el funcionamiento correcto de las validaciones con decoradores en un entorno de ejecución de Lambda**.


## Consideraciones generales que tomé para el desarrollo

A continuación, se detallan las decisiones y supuestos clave tomados durante el desarrollo de la solución.

Sobre la API NestJS
Entorno de Ejecución: Se desarrolló y probó utilizando Node.js v20, aprovechando sus mejoras de rendimiento y características modernas.

Arquitectura Hexagonal (Puertos y Adaptadores): Se eligió este patrón para lograr un alto desacoplamiento entre la lógica de negocio (dominio) y los detalles de infraestructura (framework, base de datos). Esto facilita la mantenibilidad, escalabilidad y, fundamentalmente, la capacidad de realizar pruebas unitarias del núcleo de la aplicación de forma aislada.

Persistencia en Memoria: Para cumplir con los requisitos de no depender de Docker ni de una base de datos externa, se implementó un "adaptador" de persistencia en memoria. Se mockearon datos iniciales para permitir una prueba inmediata de los endpoints. La arquitectura permite reemplazar esta implementación por una base de datos real (ej. PostgreSQL con TypeORM) sin modificar la lógica de negocio.

Inyección de Dependencias por Interfaces (Puertos): La comunicación entre capas se realiza a través de interfaces (ports), no de clases concretas. Esto invierte el control y permite que las implementaciones sean fácilmente intercambiables.

Uso de DTOs (Data Transfer Objects): Se utilizaron DTOs para definir contratos claros en la capa de API, tanto para la entrada de datos (con validaciones usando `class-validator`) como para la salida, asegurando que no se expongan detalles internos de las entidades del dominio.

Documentación de Endpoints (Swagger): La API está documentada utilizando Swagger (OpenAPI). Esto proporciona una interfaz interactiva (/api/docs) que facilita la exploración de los endpoints, sus parámetros, modelos de datos y respuestas, lo que es útil para pruebas manuales y para el consumo por parte de otros desarrolladores.

Se asumió la necesidad de añadir un campo fecha a la entidad Transferencia para poder implementar correctamente el requisito de "obtener empresas con transferencias en el último mes".

#### Sobre el Diseño AWS Lambda

Elección de Runtime: Se optó por Node.js para mantener la consistencia tecnológica con el resto del stack (NestJS).

Base de Datos (Teórica): Se propuso el uso de Amazon DynamoDB, una base de datos NoSQL totalmente administrada, ideal para casos de uso de alta escalabilidad y baja latencia como el registro de entidades simples. Su modelo sin esquema se adapta bien a la naturaleza de los datos de la empresa.

Integración con API Gateway: Se diseñó la solución para ser expuesta a través de un endpoint en API Gateway. Esto proporciona una fachada segura, escalable y desacoplada para la función Lambda.

Generación de IDs: Se asumió que la Lambda sería responsable de generar el ID único de la nueva empresa, utilizando crypto.randomUUID() para garantizar unicidad sin depender de una secuencia de base de datos.



