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
    const subject = 'You have been invited to collaborate on a project!';
    const html = `
      <h1>Project Invitation</h1>
      <p>You have been invited to collaborate on a project. Click the link below to accept the invitation:</p>
      <a href="${inviteLink}" target="_blank">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
    `;

    // Envia o e-mail
    await sendEmail(email, subject, html);

    console.log(`Invite sent to ${email}`);
  } catch (error) {
    console.error('Error sending invite:', error);
    throw new Error('Failed to send invite');
  }
}
