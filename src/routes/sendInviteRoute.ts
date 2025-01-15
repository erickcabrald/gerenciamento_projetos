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
      },
    },
    async (request, reply) => {
      try {
        const { email, projectId } = request.body as {
          email: string;
          projectId: string;
        };

        // Verifica se o e-mail e o projectId foram passados
        if (!email || !projectId) {
          return reply
            .status(400)
            .send({ error: 'Email and projectId are required' });
        }

        // Envia o convite
        await sendInvite(email, projectId);

        reply.send({ message: `Invite sent to ${email} successfully!` });
      } catch (error) {
        console.error('Error sending invite:', error);
        reply.status(500).send({ error: 'Failed to send invite' });
      }
    }
  );
}
