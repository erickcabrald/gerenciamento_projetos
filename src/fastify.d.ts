// src/fastify.d.ts
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      [key: string]: any; // Para permitir propriedades adicionais, se necessário
    };
  }
}
