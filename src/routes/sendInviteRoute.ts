import { FastifyTypeInstance } from '../types';
import { sendInvite } from '../services/sendInvite';
import { z } from 'zod';

export async function SendInviteRoute(app: FastifyTypeInstance) {
  app.post(
    '/send-invite',
    {
      schema: {
        tags: ['invite'],
        description: 'envio do convite',
        body: z.object({
          email: z.string(),
          projectId: z.string(),
        }),
        response: {
          200: z.object({
            message: z.literal('successfully!'),
          }),
          400: z.object({
            error: z.literal('Email and projectId are required'),
          }),
          500: z.object({
            error: z.literal('Failed to send invite'),
            info: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      const schemaInivite = z.object({
        email: z.string(),
        projectId: z.string(),
      });

      const result = schemaInivite.safeParse(request.body);

      if (!result.success) {
        return reply
          .status(400)
          .send({ error: 'Email and projectId are required' });
      }

      const { email, projectId } = result.data;

      try {
        // Envia o convite
        await sendInvite(email, projectId);

        return reply.status(200).send({ message: 'successfully!' });
      } catch (error) {
        console.error('Error sending invite:', error);
        reply.status(500).send({ error: 'Failed to send invite', info: error });
      }
    }
  );
}
