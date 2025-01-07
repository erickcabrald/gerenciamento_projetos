import { FastifyTypeInstance } from '../types';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function UserRoutes(app: FastifyTypeInstance) {
  app.post(
    '/user',
    {
      schema: {
        tags: ['user'],
        description: 'create User',
        body: z.object({
          name: z.string(),
          username: z.string(),
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          200: z.literal('sucess'),
          400: z.object({
            message: z.literal('erro ao criar usuario.'),
            info: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userSchema = z.object({
        name: z.string(),
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      });

      const result = userSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({
          message: 'erro ao criar usuario.',
          info: {
            menssage_error: result.error.message,
          },
        });
      }

    
    }
  );
}
