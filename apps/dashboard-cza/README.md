# dashboard-cza

Painel administrativo da plataforma CZA: gestão de usuários, projetos, convites, recuperação de senha e analytics. Parte do monorepo [project-cza](../../README.md).

## Stack

- **Vue 3** + **Vue Router** + **Pinia**
- **Vite** + **TypeScript**
- **Tailwind CSS** v4
- **Axios** (API com JWT e refresh)
- **Chart.js** (gráficos no painel de analytics)

## Pré-requisitos

- Node.js ^20.19.0 ou ≥22.12.0
- Backend da API CZA em execução

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_BASE_API_PATH` | URL base da API (ex.: `http://localhost:8080`) |

Crie um `.env` na pasta do app com o valor desejado.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (Vite). |
| `pnpm build` | Type-check + build de produção. |
| `pnpm preview` | Preview do build de produção. |
| `pnpm type-check` | Verificação de tipos (vue-tsc). |
| `pnpm lint` | ESLint com auto-fix. |
| `pnpm format` | Prettier em `src/`. |

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home. |
| `/login` | Login. |
| `/activate` | Ativação de conta (convite). |
| `/password` | Recuperação/redefinição de senha. |
| `/about` | Sobre. |
| `/dashboard/overview` | Visão geral (stats). |
| `/dashboard/projects` | Gestão de projetos. |
| `/dashboard/users` | Gestão de usuários e convites. |
| `/dashboard/analytics` | Analytics (gráficos). |

Rotas sob `/dashboard` exigem autenticação (guard no router).

## Estrutura principal

```
src/
├── api/           # Cliente Axios e funções de API
├── components/    # Componentes Vue (dashboard, modais, tabelas)
│   └── dashboard/ # Overview, projects, users, analytics, modals
├── router/        # Rotas e authManager
├── stores/        # Pinia: auth, adminUser, adminProjects, toast
├── types/         # Tipos TypeScript
├── util/          # Utilitários
└── views/         # Páginas (Home, Login, Dashboard, Activate, Password, About)
```

## Desenvolvimento

Na raiz do monorepo:

```bash
pnpm dev --filter=dashboard-cza
```

Ou dentro do app:

```bash
cd apps/dashboard-cza
pnpm install   # se ainda não instalou na raiz com pnpm install
pnpm dev
```
