import { FastifyTypeInstance } from '../types'; // Certifique-se de que o tipo está correto
import { string, z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function ProjectRoutes(app: FastifyTypeInstance) {
  app.post(
    '/project',
    {
      schema: {
        tags: ['project'],
        description: 'create project',
        body: z.object({
          name: z.string(),
          description: z.string().optional(),
          startDate: z
            .string()
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              'Invalid date format. Use YYYY-MM-DD.'
            ),
          endDate: z
            .string()
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              'Invalid date format. Use YYYY-MM-DD.'
            ),
          status: z.enum(['ongoing', 'completed', 'cancelled']).optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
          userId: z.string().uuid(),
        }),
        response: {
          201: z.literal('sucess'),
          400: z.object({
            message: z.literal('Invalid information.'),
            info: z.any().describe('infor sobre o erro'),
          }),
          500: z.object({
            message: z.literal('Erro ao criar o projeto.'),
            err: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      const projectSchema = z.object({
        name: z.string(),
        description: z.string().optional(),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
        status: z.enum(['ongoing', 'completed', 'cancelled']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        userId: z.string().uuid(),
      });

      const result = projectSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({
          message: 'Invalid information.',
          info: {
            message_error: result.error.message,
          },
        });
      }

      try {
        // Convertendo as datas para o formato Date
        const startDate = new Date(result.data.startDate);
        const endDate = new Date(result.data.endDate);
        //Criando projeto
        const newProject = await prisma.project.create({
          data: {
            name: result.data.name,
            description: result.data.description,
            startDate: startDate,
            endDate: endDate,
            status: result.data.status,
            priority: result.data.priority,
            userId: result.data.userId,
          },
        });

        return reply.status(201).send('sucess');
      } catch (error) {
        return reply
          .status(500)
          .send({ message: 'Erro ao criar o projeto.', err: error });
      }
    }
  );

  app.put(
    '/project/:id',
    {
      schema: {
        tags: ['project'],
        description: 'update project',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          startDate: z
            .string()
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              'Invalid date format. Use YYYY-MM-DD.'
            )
            .optional(),
          endDate: z
            .string()
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              'Invalid date format. Use YYYY-MM-DD.'
            )
            .optional(),
          status: z.enum(['ongoing', 'completed', 'cancelled']).optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
        }),
        response: {
          200: z.literal('sucess'),
          400: z.object({
            message: z.literal('Invalid information.'),
            info: z.any().describe('infor sobre o erro'),
          }),
          500: z.object({
            message: z.literal('Erro ao atualizar o projeto.'),
            err: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      enum Priority {
        low = 'low',
        medium = 'medium',
        high = 'high',
      }

      enum statusProject {
        ongoing = 'ongoing',
        completed = 'completed',
        cancelled = 'cancelled',
      }

      type Project = {
        name?: string;
        description?: string;
        startDate?: Date;
        endDate?: Date;
        status?: statusProject;
        priority?: Priority;
      };

      const { id } = request.params;

      const updateProjectSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.')
          .optional(),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.')
          .optional(),
        status: z
          .enum([
            statusProject.ongoing,
            statusProject.completed,
            statusProject.cancelled,
          ])
          .optional(),
        priority: z
          .enum([Priority.low, Priority.medium, Priority.high])
          .optional(),
      });

      const result = updateProjectSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({
          message: 'Invalid information.',
          info: {
            message_error: result.error.message,
          },
        });
      }

      const projectData: Project = {
        name: result.data.name,
        description: result.data.description,
        status: result.data.status,
        priority: result.data.priority,
      };

      if (result.data.startDate) {
        projectData.startDate = new Date(result.data.startDate);
      }
      if (result.data.endDate) {
        projectData.endDate = new Date(result.data.endDate);
      }

      try {
        const updateProject = await prisma.project.update({
          where: {
            id: id,
          },
          data: projectData,
        });

        return reply.status(200).send('sucess');
      } catch (error) {
        return reply
          .status(500)
          .send({ message: 'Erro ao atualizar o projeto.', err: error });
      }
    }
  );

  app.get(
    '/project',
    {
      schema: {
        tags: ['project'],
        description: 'lista all project',
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              description: z.string().nullable(),
              status: z.string().nullable(),
              priority: z.string().nullable(),
              startDate: z.date(),
              endDate: z.date(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
          ),
          500: z.object({
            message: z.literal('erro ao listar todos projetos'),
            err: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const projects = await prisma.project.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return reply.status(200).send(projects);
      } catch (error) {
        console.error(error);

        return reply
          .status(500)
          .send({ message: 'erro ao listar todos projetos', err: error });
      }
    }
  );

  app.get(
    '/project/:userId',
    {
      schema: {
        tags: ['project'],
        description: 'lista all project',
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: {
          200: z.array(
            z.object({
              name: z.string(),
              description: z.string().nullable(),
              status: z.string().nullable(),
              priority: z.string().nullable(),
              startDate: z.date(),
              endDate: z.date(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
          ),
          500: z.object({
            message: z.literal('erro ao listar todos os projetos'),
            err: z.any(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.params;

      try {
        const projects = await prisma.project.findMany({
          where: {
            userId: userId,
          },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return reply.status(200).send(projects);
      } catch (error) {
        console.error(error);

        return reply
          .status(500)
          .send({ message: 'erro ao listar todos os projetos', err: error });
      }
    }
  );
}
