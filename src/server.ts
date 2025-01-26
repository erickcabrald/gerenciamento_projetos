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
import authRoutes from './routes/authRoutes';

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
app.register(authRoutes);

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Server running at http://localhost:3333');
  console.log('📚 Swagger docs available at http://localhost:3333/docs');

  const openApiSpec = app.swagger();
  const outputPath = path.resolve(__dirname, './docs/openapi.json');
  fs.writeFile(outputPath, JSON.stringify(openApiSpec, null, 2), (err) => {
    if (err) {
      console.error('Failed to save OpenAPI spec:', err);
    } else {
      console.log(`✅ OpenAPI specification saved at: ${outputPath}`);
    }
  });
});
