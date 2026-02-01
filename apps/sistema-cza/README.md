# sistema-cza

Aplicativo do sistema CZA para o usuário final: fluxo de preflight (seleção de projeto), opções e editor IFC. Inclui testes unitários (Vitest) e E2E (Cypress). Parte do monorepo [project-cza](../../README.md).

## Stack

- **Vue 3** + **Vue Router** + **Pinia**
- **Vite** + **TypeScript**
- **Tailwind CSS** v4
- **That Open Components** + **web-ifc** + **Three.js** (editor IFC/3D)
- **Axios** (API com JWT)
- **Vitest** (testes unitários)
- **Cypress** (testes E2E)

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
| `pnpm lint` | ESLint com auto-fix e cache. |
| `pnpm format` | Prettier em `src/`. |
| `pnpm test:unit` | Testes unitários (Vitest). |
| `pnpm test:e2e:dev` | Cypress E2E contra o dev server (porta 4173). |
| `pnpm test:e2e` | Cypress E2E contra o build de produção (preview na 4173). |

Para `test:e2e`, faça antes `pnpm build` e use o preview na porta 4173.

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home. |
| `/login` | Login. |
| `/about` | Sobre. |
| `/preflight` | Seleção de projeto. Requer auth. |
| `/options` | Opções. Requer auth. |
| `/editor` | Editor IFC. Requer auth. |

## Estrutura principal

```
src/
├── api/           # Cliente Axios e chamadas à API
├── components/    # NavBar, ProjectSelector, OptionSelector, Toast, etc.
├── editor/        # editorModel, editorController, gizmo (IFC/3D)
├── router/        # Rotas e guards de auth
├── stores/        # Pinia: auth, projects, data, telemetry
├── types/         # Tipos TypeScript
├── util/          # authWatcher, utilitários
├── views/         # Home, Login, PreflightView, OptionsView, EditorView, About
└── __tests__/     # Testes unitários (ex.: App.spec.ts)
cypress/           # E2E (fixtures, support, e2e)
```

## Desenvolvimento

Na raiz do monorepo:

```bash
pnpm dev --filter=sistema-cza
```

Ou dentro do app:

```bash
cd apps/sistema-cza
pnpm install   # se ainda não instalou na raiz com pnpm install
pnpm dev
```

## Testes

- **Unitários:** `pnpm test:unit` (Vitest, arquivos em `src/__tests__/` e config no `vitest.config.ts`).
- **E2E:** `pnpm test:e2e:dev` abre o Cypress contra o dev server; `pnpm test:e2e` roda contra o build (preview). Especificar porta 4173 no comando de preview se necessário.
