import { FastifyReply, FastifyRequest } from 'fastify';
import { verifyToken } from '../services/jwt';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Token inválido ou expirado' });
  }
}
