# editor-cza

Editor de configuração IFC/BIM da plataforma CZA: carregar modelos IFC, editar grupos, combos e plantas, importar/exportar config em JSON e visualizar em 3D. Parte do monorepo [project-cza](../../README.md).

## Stack

- **Vue 3** + **Vue Router** + **Pinia**
- **Vite** + **TypeScript**
- **Tailwind CSS** v4
- **That Open Components** (`@thatopen/components`, `@thatopen/components-front`, `@thatopen/fragments`)
- **web-ifc** + **Three.js** (IFC e 3D)
- **Axios** (API com JWT)

## Pré-requisitos

- Node.js ^20.19.0 ou ≥22.12.0
- Backend da API CZA em execução (para auth e projetos)

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

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home. |
| `/login` | Login. |
| `/editor` | Editor de configurações (IFC, grupos, combos, plantas). Requer auth. |
| `/about` | Sobre. |

## Estrutura principal

```
src/
├── api/           # Cliente Axios e chamadas à API
├── components/    # Componentes Vue (NavBar, ProjectSelector, cards do editor)
│   └── editor/    # ComboCard, GroupsCard, PlantsCard, modais (IfcEditor, etc.)
├── editor/        # Lógica do editor 3D/IFC
│   ├── editorModel.ts   # Mundo, fragments, IFC loader, planos, gizmo
│   ├── editorController.ts
│   └── gizmo/     # Gizmo 3D
├── router/        # Rotas e authManager
├── stores/        # Pinia: auth, projects
├── types/         # Tipos TypeScript
├── util/          # authWatcher, utilitários
└── views/         # Home, Login, EditorView, About
```

O **EditorView** oferece: carregar JSON, download JSON, definir IFC base, enviar seleção para a API, e edição de grupos/combos/plantas via modais.

## Desenvolvimento

Na raiz do monorepo:

```bash
pnpm dev --filter=editor-cza
```

Ou dentro do app:

```bash
cd apps/editor-cza
pnpm install   # se ainda não instalou na raiz com pnpm install
pnpm dev
```
