import { FastifyTypeInstance } from '../types'; // Certifique-se de que o tipo está correto
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Funções
async function checkIfEmailExist(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return !!user;
}

async function checkIfUserNameExist(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  return !!user;
}

export async function UserRoutes(app: FastifyTypeInstance) {
  app.post(
    '/user',
    {
      schema: {
        tags: ['user'],
        description: 'Create a new user',
        body: z.object({
          name: z.string(),
          username: z.string(),
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          200: z.literal('sucess'),
          400: z.union([
            z.object({
              message: z.literal('erro ao criar usuario.'),
              info: z.any(),
            }),
            z.object({
              message: z.literal('email já registrado.'),
              email: z.string(),
            }),
            z.object({
              message: z.literal('username já registrado.'),
              username: z.string(),
            }),
          ]),
        },
      },
    },
    async (request, reply) => {
      const userSchema = z.object({
        name: z.string(),
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      });

      const result = userSchema.safeParse(request.body);

      if (!result.success) {
        return reply.status(400).send({
          message: 'erro ao criar usuario.',
          info: {
            message_error: result.error.message,
          },
        });
      }

      const { name, username, email, password } = result.data;

      // Verificar se o e-mail já está registrado
      if (await checkIfEmailExist(email)) {
        return reply.status(400).send({
          message: 'email já registrado.',
          email,
        });
      }

      // Verificar se o username já está registrado
      if (await checkIfUserNameExist(username)) {
        return reply.status(400).send({
          message: 'username já registrado.',
          username,
        });
      }

      // Criar o usuário no banco de dados
      try {
        //criptografando senha
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
          data: {
            name,
            username,
            email,
            password: hashedPassword,
          },
        });

        return reply.status(200).send('sucess');
      } catch (error) {
        return reply.status(500).send({
          message: 'erro ao criar usuario.',
          info: {
            error: error.message,
          },
        });
      }
    }
  );

  // Rota para atualizar um usuário
  app.put(
    '/user/:id',
    {
      schema: {
        tags: ['user'],
        description: 'Update a user by ID',
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          username: z.string().optional(),
          email: z.string().email().optional(),
          password: z.string().optional(),
        }),
        response: {
          200: z.literal('sucess'),
          404: z.literal('usuario nao encontrado'),
          400: z.union([
            z.object({
              message: z.literal('informação invalida.'),
              info: z.any(),
            }),
            z.object({
              message: z.literal('email já registrado.'),
              email: z.string(),
            }),
            z.object({
              message: z.literal('username já registrado.'),
              username: z.string(),
            }),
          ]),
          500: z.literal('erro ao atualizar usuario'),
        },
      },
    },
    async (request, reply) => {
      type updateUser = {
        name?: string;
        username?: string | undefined;
        email?: string | undefined;
        password?: string;
      };

      const { id } = request.params;

      const updateUserSchema = z.object({
        name: z.string().optional(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
      });
      const result = updateUserSchema.safeParse(request.body);

      if (!result.success) {
        return reply
          .status(400)
          .send({ message: 'informação invalida.', info: result.error.errors });
      }
      const { email, username, name, password } = result.data;

      const userData: updateUser = {
        name,
        password,
      };

      try {
        // Verificar se o e-mail já está registrado
        if (email && (await checkIfEmailExist(email))) {
          return reply.status(400).send({
            message: 'email já registrado.',
            email,
          });
        }

        // Verificar se o username já está registrado
        if (username && (await checkIfUserNameExist(username))) {
          return reply.status(400).send({
            message: 'username já registrado.',
            username,
          });
        }

        userData.email = email;
        userData.username = username;

        const user = await prisma.user.update({
          where: {
            id: id,
          },
          data: userData,
        });

        if (!user) {
          return reply.status(404).send('usuario nao encontrado');
        }

        return reply.status(200).send('sucess');
      } catch (error) {
        console.error(error);
        return reply.status(500).send('erro ao atualizar usuario');
      }
    }
  );

  // Rota para obter todos os usuários
  app.get(
    '/user',
    {
      schema: {
        tags: ['user'],
        description: 'get users',
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              username: z.string(),
              email: z.string().email(),
              password: z.string(),
            })
          ),
          500: z.literal('erro ao buscar usuario'),
        },
      },
    },
    async (request, reply) => {
      try {
        const users = await prisma.user.findMany();

        return reply.status(200).send(users);
      } catch (err) {
        console.error(err);
        return reply.status(500).send('erro ao buscar usuario');
      }
    }
  );

  // Rota para obter um único usuário pelo ID
  app.get(
    '/user/:id',
    {
      schema: {
        tags: ['user'],
        description: 'Get a user by ID',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            username: z.string(),
            email: z.string().email(),
            password: z.string(),
          }),
          404: z.literal('usuario nao encontrado'),
          500: z.literal('erro ao buscar usuario'),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const user = await prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          return reply.status(404).send('usuario nao encontrado');
        }

        return reply.status(200).send(user);
      } catch (error) {
        console.error(error);
        return reply.status(500).send('erro ao buscar usuario');
      }
    }
  );

  // Rota para deletar um usuário
  app.delete(
    '/user/:id',
    {
      schema: {
        tags: ['user'],
        description: 'Delete a user by ID',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.literal('sucess'),
          404: z.literal('usuario nao encontrado'),
          500: z.literal('erro ao deletar usuario'),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const user = await prisma.user.delete({
          where: { id },
        });

        if (!user) {
          return reply.status(404).send('usuario nao encontrado');
        }

        return reply.status(200).send('sucess');
      } catch (error) {
        console.error(error);
        return reply.status(500).send('erro ao deletar usuario');
      }
    }
  );
}
