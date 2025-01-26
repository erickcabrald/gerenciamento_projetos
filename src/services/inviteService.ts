import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createInvite(
  email: string,
  projectId: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const payload = { email, projectId, userId: user.id };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  const existingInvite = await prisma.invite.findFirst({
    where: { token },
  });

  await prisma.invite.create({
    data: {
      email,
      token,
      projectId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
    },
  });

  return token; // Retorna o token JWT gerado
}
