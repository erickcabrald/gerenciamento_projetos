import { FastifyTypeInstance } from '../types';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verifica se o usuário participa do projeto
async function isUserInProject(userId: string, projectId: string) {
  const invite = await prisma.invite.findFirst({
    where: {
      projectId,
      email: {
        equals: (
          await prisma.user.findUnique({ where: { id: userId } })
        )?.email,
      },
      status: 'Accepted',
    },
  });

  return invite !== null;
}

export async function taskRoutes(app: FastifyTypeInstance) {
  // Rota para criar uma nova tarefa
  app.post(
    '/task',
    {
      schema: {
        tags: ['task'],
        description: 'Create a new task',
        body: z.object({
          userId: z.string(),
          projectId: z.string(),
          description: z.string().optional(),
          name: z.string(),
          due_date: z
            .string()
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              'Invalid date format. Use YYYY-MM-DD.'
            ),
          status: z.enum(['Pending', 'In_progress', 'completed']).optional(),
          priority: z.enum(['low', 'medium', 'high']),
        }),
        response: {
          200: z.object({ message: z.literal('Task created successfully') }),
          400: z.object({
            message: z.literal('Validation error'),
            info: z.any(),
          }),
          404: z.literal('User does not participate in this project'),
        },
      },
    },
    async (request, reply) => {
      const taskSchema = z.object({
        userId: z.string(),
        projectId: z.string(),
        description: z.string().optional(),
        name: z.string(),
        due_date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
        status: z.enum(['Pending', 'In_progress', 'completed']).optional(),
        priority: z.enum(['low', 'medium', 'high']),
      });

      const result = taskSchema.safeParse(request.body);

      if (!result.success) {
        return reply
          .status(400)
          .send({ message: 'Validation error', info: result.error.errors });
      }

      const {
        userId,
        projectId,
        description,
        name,
        due_date,
        status,
        priority,
      } = result.data;

      const taskData = {
        description,
        name,
        due_date,
        status,
        priority,
      };

      try {
        const isParticipant = await isUserInProject(userId, projectId);

        if (!isParticipant) {
          return reply
            .status(404)
            .send('User does not participate in this project');
        }

        await prisma.task.create({
          data: {
            ...taskData,
            userId: userId,
            projectId: projectId,
          },
        });

        return reply.status(200).send({ message: 'Task created successfully' });
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send('User does not participate in this project');
      }
    }
  );

  // Rota para listar tarefas de um projeto
  app.get('/tasks/:projectId', async (request, reply) => {
    const paramsSchema = z.object({
      projectId: z.string(),
    });

    const result = paramsSchema.safeParse(request.params);

    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid projectId', info: result.error.errors });
    }

    const { projectId } = result.data;

    try {
      const tasks = await prisma.task.findMany({
        where: { projectId },
      });

      return reply.status(200).send(tasks);
    } catch (error) {
      console.error(error);
      return reply.status(500).send('Internal server error');
    }
  });

  app.put('/task/:taskId', async (request, reply) => {
    const paramsSchema = z.object({
      taskId: z.string(),
    });

    const bodySchema = z.object({
      description: z.string().optional(),
      name: z.string().optional(),
      due_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.')
        .optional(),
      status: z.enum(['Pending', 'In_progress', 'completed']).optional(), // Corrigido aqui
      priority: z.enum(['low', 'medium', 'high']).optional(),
    });

    const paramsResult = paramsSchema.safeParse(request.params);
    const bodyResult = bodySchema.safeParse(request.body);

    if (!paramsResult.success || !bodyResult.success) {
      return reply.status(400).send({ message: 'Validation error' });
    }

    const { taskId } = paramsResult.data;
    const updates = bodyResult.data;

    try {
      const task = await prisma.task.update({
        where: { id: parseInt(taskId, 10) },
        data: updates,
      });

      return reply.status(200).send(task);
    } catch (error) {
      console.error(error);
      return reply.status(500).send('Internal server error');
    }
  });

  // Rota para deletar uma tarefa
  app.delete('/task/:taskId', async (request, reply) => {
    const paramsSchema = z.object({
      taskId: z.string(),
    });

    const result = paramsSchema.safeParse(request.params);

    if (!result.success) {
      return reply
        .status(400)
        .send({ message: 'Invalid taskId', info: result.error.errors });
    }

    const { taskId } = result.data;

    try {
      await prisma.task.delete({
        where: { id: parseInt(taskId, 10) },
      });

      return reply.status(200).send({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error(error);
      return reply.status(500).send('Internal server error');
    }
  });
}
