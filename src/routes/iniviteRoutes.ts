import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { FastifyTypeInstance } from '../types';

const prisma = new PrismaClient();

export async function InviteRoute(app: FastifyTypeInstance) {
  app.get('/accept-invite', async (request, reply) => {
    try {
      const { token } = request.query as { token: string };

      if (!token) {
        return reply.status(400).send({ error: 'Token is required' });
      }

      // Decodificar o token JWT para obter projectId e userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        projectId: string;
        userId: string;
      };
      const { projectId, userId } = decoded;

      // Verificar se o convite existe pelo projectId e status 'Pending'
      const invite = await prisma.invite.findFirst({
        where: { projectId, status: 'Pending' }, // Procurando pelo projeto e status pendente
        include: { project: true },
      });

      if (!invite) {
        return reply
          .status(404)
          .send({ error: 'Invite not found or expired.' });
      }

      // Verificar se o token decodificado corresponde ao token do convite
      if (invite.token !== token) {
        return reply.status(400).send({ error: 'Invalid token.' });
      }

      // Adicionar o usuário ao projeto
      await prisma.project.update({
        where: { id: projectId },
        data: {
          user: {
            connect: { id: userId },
          },
        },
      });

      // Atualizar o status do convite para 'Accepted'
      await prisma.invite.update({
        where: { id: invite.id }, // Agora usamos o ID do convite como identificador único
        data: {
          status: 'Accepted',
        },
      });

      reply.send({ message: 'Invite accepted successfully!' });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Something went wrong!' });
    }
  });
}
