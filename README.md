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
2. Zod
3. JWT
4. mysql

# Banco de dados

##

### 1. **Tabela: `users`**

Armazena informações dos usuários do sistema.

| Campo           | Tipo                                   | Descrição                                           |
| --------------- | -------------------------------------- | --------------------------------------------------- |
| `id`            | `INTEGER` (PK)                         | Identificador único do usuário                      |
| `name`          | `VARCHAR(255)`                         | Nome completo do usuário                            |
| `username`      | `VARCHAR(255)`                         | Nome de usuário único (opcional)                    |
| `email`         | `VARCHAR(255)`                         | E-mail único do usuário                             |
| `password_hash` | `VARCHAR(255)`                         | Senha criptografada do usuário                      |
| `status`        | `ENUM('active', 'inactive', 'banned')` | Status da conta do usuário (Ativo, Inativo, Banido) |
| `created_at`    | `TIMESTAMP`                            | Data e hora de criação da conta                     |
| `updated_at`    | `TIMESTAMP`                            | Data e hora da última atualização                   |

### 2. **Tabela: `projects`**

Armazena as informações sobre os projetos.

| Campo         | Tipo                                        | Descrição                                              |
| ------------- | ------------------------------------------- | ------------------------------------------------------ |
| `id`          | `INTEGER` (PK)                              | Identificador único do projeto                         |
| `name`        | `VARCHAR(255)`                              | Nome do projeto                                        |
| `description` | `TEXT`                                      | Descrição detalhada do projeto                         |
| `start_date`  | `DATE`                                      | Data de início do projeto                              |
| `end_date`    | `DATE`                                      | Data de término prevista do projeto                    |
| `status`      | `ENUM('ongoing', 'completed', 'cancelled')` | Status do projeto (Em andamento, Concluído, Cancelado) |
| `priority`    | `ENUM('low', 'medium', 'high')`             | Prioridade do projeto (Baixa, Média, Alta)             |
| `created_by`  | `INTEGER` (FK -> users.id)                  | ID do usuário que criou o projeto (proprietário)       |
| `created_at`  | `TIMESTAMP`                                 | Data e hora de criação do projeto                      |
| `updated_at`  | `TIMESTAMP`                                 | Data e hora da última atualização do projeto           |

### 3. **Tabela: `tasks`**

Armazena as informações sobre as tarefas dentro de um projeto.

| Campo         | Tipo                                          | Descrição                                            |
| ------------- | --------------------------------------------- | ---------------------------------------------------- |
| `id`          | `INTEGER` (PK)                                | Identificador único da tarefa                        |
| `project_id`  | `INTEGER` (FK -> projects.id)                 | ID do projeto ao qual a tarefa pertence              |
| `name`        | `VARCHAR(255)`                                | Nome da tarefa                                       |
| `description` | `TEXT`                                        | Descrição detalhada da tarefa                        |
| `assigned_to` | `INTEGER` (FK -> users.id)                    | ID do usuário responsável pela tarefa                |
| `due_date`    | `DATE`                                        | Data de vencimento da tarefa                         |
| `status`      | `ENUM('pending', 'in_progress', 'completed')` | Status da tarefa (Pendente, Em andamento, Concluída) |
| `priority`    | `ENUM('low', 'medium', 'high')`               | Prioridade da tarefa (Baixa, Média, Alta)            |
| `created_at`  | `TIMESTAMP`                                   | Data e hora de criação da tarefa                     |
| `updated_at`  | `TIMESTAMP`                                   | Data e hora da última atualização da tarefa          |

### 4. **Tabela: `project_users`**

Armazena os usuários que estão associados a um projeto, incluindo o papel (por exemplo, administrador ou membro).

| Campo         | Tipo                            | Descrição                                             |
| ------------- | ------------------------------- | ----------------------------------------------------- |
| `project_id`  | `INTEGER` (FK -> `projects.id`) | ID do projeto                                         |
| `user_id`     | `INTEGER` (FK -> `users.id`)    | ID do usuário                                         |
| `role`        | `ENUM('admin', 'member')`       | Papel do usuário no projeto (Administrador ou Membro) |
| `invited_at`  | `TIMESTAMP`                     | Data e hora de convite para o projeto                 |
| `accepted_at` | `TIMESTAMP`                     | Data e hora em que o convite foi aceito               |

### Relacionamentos:

- **`users` e `projects`**: Um usuário pode criar vários projetos, mas cada projeto tem um único criador (`created_by`).
- **`projects` e `tasks`**: Cada projeto pode ter várias tarefas. As tarefas são relacionadas ao projeto através do `project_id`.
- **`users` e `tasks`**: Cada tarefa pode ser atribuída a um usuário através do campo `assigned_to`.
- **`users` e `projects`**: A tabela `project_users` gerencia os usuários que fazem parte de cada projeto e seus papéis dentro dele.
