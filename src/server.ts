import { fastify } from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { fastifyCors } from '@fastify/cors';
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';

import fs from 'fs';
import path from 'path';
// Rotas
import { UserRoutes } from './routes/userRoutes';
import { ProjectRoutes } from './routes/projectRoutes';
import { InviteRoute } from './routes/iniviteRoutes';
import { SendInviteRoute } from './routes/sendInviteRoute';
import { taskRoutes } from './routes/taskRoutes';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: '*' });

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'To-Do List API',
      description: 'API para gerenciar tarefas, projetos e convites',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(UserRoutes);
app.register(ProjectRoutes);
app.register(taskRoutes);
app.register(SendInviteRoute);
app.register(InviteRoute);

const startServer = async () => {
  try {
    await app.listen({ port: 3333 });

    // Salvar a especificação OpenAPI automaticamente
    const openApiSpec = app.swagger();
    const outputPath = path.resolve(__dirname, './docs/openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2));
    console.log(`✅ OpenAPI specification saved at: ${outputPath}`);

    console.log('🚀 Server running at http://localhost:3333');
    console.log('📚 Swagger docs available at http://localhost:3333/docs');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
