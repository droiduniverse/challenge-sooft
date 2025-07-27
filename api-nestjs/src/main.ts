import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });  

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('API Desafio SOOFT Technology')
    .setDescription('Documentación de la API para el desafío técnico de SOOFT Technology')
    .setVersion('1.0')
    .addTag('empresas') 
    .addTag('auth') 
    .addBearerAuth( 
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Introduce tu token JWT (sin el prefijo Bearer)',
        in: 'header',
      },
      'access-token' 
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // La documentación estará disponible en http://localhost:3000/api/docs
  // --- Fin Configuración de Swagger ---


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();