import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { generateToken } from '../services/jwt';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return reply
        .status(400)
        .send({ error: 'Email and password are required' });
    }

    // 1. Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    // 2. Validar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    // 3. Gerar um token JWT
    const token = generateToken({ id: user.id, email: user.email });

    // 4. Retornar o token ao cliente
    return reply.status(200).send({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });
}
