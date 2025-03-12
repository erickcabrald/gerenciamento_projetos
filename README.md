## Objetivo:

Criar uma API de gerenciamento de projetos, onde um usuário pode criar, gerenciar e organizar seus projetos de forma mais eficiente.

### Funcionalidades do usuário:

- O usuário pode criar, deletar, buscar e modificar projetos | CRUD.
- O usuário pode convidar outros usuários para participar de seus projetos.
- O usuário (Administrador) pode definir tarefas para os outros usuários.

### Características dos Projetos:

- Prazo de conclusão do projeto.
- Data de início do projeto.
- Prazo das tarefas dentro do projeto.
- Tecnologias utilizadas no projeto.
- Descrição detalhada do projeto.
- Status do projeto (Em andamento, Concluído, Cancelado).
- Prioridade do projeto (Baixa, Média, Alta).
- Categoria do projeto (Desenvolvimento de software, Pesquisa, Marketing, etc.).
- Visibilidade do projeto (Público ou Privado).

### Funcionalidades:

- O usuário pode criar, editar, atribuir e deletar tarefas.
- Cada tarefa pode ter um prazo de entrega e status (Pendente, Em andamento, Concluída).
- O usuário pode definir a prioridade das tarefas (Baixa, Média, Alta).
- O sistema deve enviar notificações para os usuários sobre o status das tarefas.

### Funcionalidades de Colaboração:

- O administrador pode convidar novos membros para o projeto por e-mail ou nome de usuário.
- Os membros podem ser designados para tarefas específicas dentro do projeto.
- O administrador pode definir permissões para os membros (Visualizar, Editar, Concluir tarefas, etc.).

### Funcionalidades de Controle de Progresso:

- O administrador e os membros podem ver o progresso geral do projeto, com gráficos ou indicadores de conclusão.
- Relatórios automáticos sobre o andamento do projeto e das tarefas.

### Autenticação e Autorização:

- A API deve ter um sistema de autenticação de usuários (login/logout).
- A autenticação deve ser baseada em token (JWT).
- Diferentes níveis de acesso devem ser configurados (Usuário comum, Administrador).

### Tecnologias Ultilizadas:

1. Fastify
2. Swagger
3. Zod
4. Bcrypt
5. JWT
6. Prisma
7. mysql

