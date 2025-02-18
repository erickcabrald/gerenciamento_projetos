import { sendEmail } from './emailService';
import { createInvite } from './inviteService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendInvite(email: string, projectId: string) {
  try {
    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Cria o convite e obtém o token
    const token = await createInvite(email, projectId);

    // URL para aceitar o convite
    const inviteLink = `http://localhost:3333/accept-invite?token=${token}`;

    // Conteúdo do e-mail
    const subject = 'Você está sendo convidado a participar de um projeto!';
    const html = `
      <h1Convite de colaboração/h1>
      <p>você está sendo convidado participar do projeto ${project?.name}. Click no link a seguir para aceitar o convite:</p>
      <a href="${inviteLink}" target="_blank">Aceitar convite</a>
      <p>este convite espira em 7 dias.</p>
    `;

    // Envia o e-mail
    await sendEmail(email, subject, html);

    console.log(`Invite sent to ${email}`);
  } catch (error) {
    console.error('Error sending invite:', error);
    throw new Error('Failed to send invite');
  }
}
