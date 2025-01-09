import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { UserRoutes } from './routes/userRoutes';
import { ProjectRoutes } from './routes/projectRoutes';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: '*' });

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'todo list',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(UserRoutes);
app.register(ProjectRoutes);

app.listen({ port: 3333 }).then(() => {
  console.log('Server running');
});
