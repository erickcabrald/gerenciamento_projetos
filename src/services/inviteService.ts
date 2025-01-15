import jwt from 'jsonwebtoken'; // Importe a biblioteca jsonwebtoken
import { PrismaClient } from '@prisma/client'; // Certifique-se de que este caminho esteja correto
const prisma = new PrismaClient();

/**
 * Cria um convite no banco de dados e retorna o token JWT.
 * @param email - E-mail do usuário a ser convidado.
 * @param projectId - ID do projeto ao qual o convite está relacionado.
 * @returns Token JWT gerado para o convite.
 */
export async function createInvite(
  email: string,
  projectId: string
): Promise<string> {
  // Encontrar o usuário pelo e-mail (ou outra forma que você preferir)
  const user = await prisma.user.findUnique({
    where: { email }, // Pode ser alterado caso você queira usar outro campo
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Payload que você deseja incluir no token
  const payload = { email, projectId, userId: user.id };

  // Gera o token JWT com um tempo de expiração de 7 dias
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  const existingInvite = await prisma.invite.findFirst({
    where: { token },
  });

  // Salva o convite no banco de dados com o token gerado
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
