# Project CZA

Monorepo da plataforma CZA BIM/IFC: painel administrativo, editor de configuração IFC e aplicativo do sistema para o usuário final. Desenvolvido com [Turborepo](https://turbo.build/), [Vue 3](https://vuejs.org/), [Vite](https://vite.dev/) e [TypeScript](https://www.typescriptlang.org/).

## O que há no repositório

| App | Descrição |
|-----|-----------|
| **dashboard-cza** | Painel administrativo: usuários, projetos, convites, recuperação de senha e analytics. |
| **editor-cza** | Editor de configuração IFC/BIM: carregar modelos IFC, editar grupos/combos/plantas, config em JSON e visualizador 3D. |
| **sistema-cza** | Fluxo para o usuário final: seleção de projeto (preflight), opções e editor; inclui testes E2E (Cypress) e unitários (Vitest). |

Todos os apps são frontends SPA em Vue 3 que se comunicam com uma API backend compartilhada (autenticação JWT, REST). Os apps de editor usam [That Open Components](https://thatopen.com/) e [web-ifc](https://github.com/ThatOpen/web-ifc) para carregar IFC e exibir o 3D.

## Pré-requisitos

- **Node.js** ≥ 22
- **pnpm** 9.x (ver `package.json` na raiz → `packageManager`)

## Configuração

```bash
# Instalar dependências (na raiz do repositório)
pnpm install
```

## Variáveis de ambiente

Cada app que chama a API espera:

| Variável | Descrição |
|----------|------------|
| `VITE_BASE_API_PATH` | URL base da API do backend (ex.: `https://api.exemplo.com`) |

Crie um arquivo `.env` (ou `.env.local`) na pasta do app ou na raiz, conforme necessário. Exemplo:

```env
VITE_BASE_API_PATH=http://localhost:8080
```

Variáveis do backend referenciadas no Turbo (para uso futuro/backend): `DB_NAME`, `PORT`, `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, etc.

## Scripts

Na **raiz do repositório**:

| Comando            | Descrição                                               |
|--------------------|---------------------------------------------------------|
| `pnpm turbo dev`   | Subir todos os apps em modo de desenvolvimento (Turbo). |
| `pnpm turbo build` | Fazer o build de todos os apps.                         |
| `pnpm lint`        | Rodar lint em todos os apps.                            |
| `pnpm format`      | Formatar o código com Prettier.                         |
| `pnpm check-types` | Verificar tipos em todos os apps.                       |

Para rodar apenas um app:

```bash
pnpm dev --filter=dashboard-cza
pnpm dev --filter=editor-cza
pnpm dev --filter=sistema-cza
```

Ou a partir da pasta do app:

```bash
cd apps/dashboard-cza && pnpm dev
cd apps/editor-cza   && pnpm dev
cd apps/sistema-cza && pnpm dev
```

### Apenas em sistema-cza (A SER IMPLEMENTADO)

- `pnpm test:unit` — testes unitários (Vitest)
- `pnpm test:e2e:dev` — testes E2E com Cypress contra o servidor de desenvolvimento
- `pnpm test:e2e` — testes E2E contra o build de produção (`pnpm build` e depois preview)

## Estrutura do projeto

```
project-cza/
├── apps/
│   ├── dashboard-cza/    # Interface administrativa
│   ├── editor-cza/       # Editor de config IFC
│   └── sistema-cza/      # App para o usuário final + testes
├── package.json          # Scripts da raiz, Turbo, Prettier
├── pnpm-workspace.yaml   # apps/*, packages/*
├── turbo.json            # Tarefas e env do Turbo
└── README.md
```

Cada app segue uma estrutura parecida:

- `src/api/` — Instância do Axios e funções de API
- `src/components/` — Componentes Vue
- `src/router/` — Vue Router e guards de autenticação
- `src/stores/` — Stores Pinia (ex.: auth, projects)
- `src/views/` — Views das rotas
- `src/types/` — Tipos TypeScript compartilhados

## Stack do projeto

- **Monorepo:** Turborepo, pnpm workspaces
- **Frontend:** Vue 3, Vue Router, Pinia, TypeScript, Vite
- **Estilos:** Tailwind CSS v4
- **Editor/IFC:** That Open Components, web-ifc, Three.js
- **Dashboard:** Chart.js, Axios
- **Testes (sistema-cza):** Vitest, Cypress
- **CI:** GitHub Actions (ex.: Qodana code quality)
- **Deploy:** Configuração Vercel por app (`vercel.json`)

## Autenticação

Os apps usam tokens JWT de acesso e de refresh. O cliente de API (Axios):

- Envia `Authorization: Bearer <accessToken>` nas requisições
- Em resposta 401, renova o token (e enfileira requisições em andamento)
- Usa cookies para o refresh quando o backend exige (`withCredentials: true`)

Rotas protegidas usam `meta: { requiresAuth: true }` e um guard global `beforeEach` que redireciona para a tela de login quando o usuário não está autenticado.

## Licença

Privado. Ver configurações do repositório.
