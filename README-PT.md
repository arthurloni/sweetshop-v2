# Documentação do Projeto — Meu Doce Doceria Artesanal

🌐 Leia em: [Inglês](README-EN.md) | [Resumo Principal](README.md)

Plataforma web interativa e centrada no usuário (UCD) para a **Meu Doce — Confeitaria Artesanal**. O projeto foi evoluído para uma arquitetura moderna baseada em **JavaScript, TypeScript, Angular (v19 LTS) e Bootstrap (v5.3.8)** no frontend, integrada a um backend em **Node.js + Express** e banco de dados **PostgreSQL** (`pg` / `PGlite`).

A aplicação preserva a identidade visual editorial em tons de branco (`#FFFFFF`), off-white rosado (`#FFF9FB`, `#FDF8F9`), blush (`#FCEEF2`) e rosa antigo (`#C86D88`), contando com página principal institucional, página exclusiva do cardápio (`/cardapio`), carrinho de compras persistente, mural de avaliações com rolagem interna, localização via Google Maps e autenticação/autorização administrativa para gestão do catálogo e moderação de avaliações.

---

## 1. Stack Tecnológica e Versões Adotadas

* **Frontend:**
  * **Angular:** `19.2.25` (`@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`, `@angular/platform-browser`)
  * **Angular CLI & Build:** `19.2.27` (`@angular/cli`, `@angular/build`, `@angular/compiler-cli@19.2.25`)
  * **Estilização:** **Bootstrap** `^5.3.8` + variáveis CSS editoriais da marca (`src/index.css`)
  * **Linguagens:** TypeScript (`~5.8.2`) e JavaScript (`ES2022`)
* **Backend:**
  * **Runtime:** Node.js (`v24.19.0`) + `tsx` (`^4.21.0`)
  * **Servidor HTTP / API REST:** Express (`^4.21.2`)
  * **Segurança & Autenticação:** Node.js `crypto` nativo (`scrypt` com salt aleatório para hash de senhas e assinatura `HMAC-SHA256` para tokens de sessão e cookies `HttpOnly`)
* **Banco de Dados:**
  * **PostgreSQL:** `pg` (`^8.23.1`) para conexão com servidor PostgreSQL externo/local ou `@electric-sql/pglite` (`^0.5.12`) para banco PostgreSQL embarcado persistido em `./pgdata`.

---

## 2. Configuração Local e Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado no arquivo `.env.example`). **Nunca versione senhas ou segredos reais no repositório.**

### Variáveis de Ambiente Necessárias

| Variável | Descrição |
| :--- | :--- |
| `PORT` | Porta do servidor Express (padrão: `3000`) |
| `AUTH_SECRET` | Segredo utilizado para assinatura `HMAC-SHA256` dos tokens de sessão |
| `ADMIN_USERNAME` | Nome de usuário único do administrador inicial |
| `ADMIN_PASSWORD` | Senha do administrador inicial (convertida e armazenada com hash `scrypt`) |
| `PGHOST` | Host do PostgreSQL externo (se vazio, utiliza o PostgreSQL embarcado em `./pgdata`) |
| `PGPORT` | Porta do PostgreSQL externo (padrão: `5432`) |
| `PGUSER` | Usuário do banco PostgreSQL externo |
| `PGPASSWORD` | Senha do banco PostgreSQL externo |
| `PGDATABASE` | Nome do banco de dados no PostgreSQL externo |

### Inicialização Segura do Primeiro Administrador

1. Defina `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `AUTH_SECRET` no seu arquivo `.env` local.
2. Ao iniciar o servidor backend (`npm run server` ou `npm run dev`), a rotina de inicialização (`bootstrapAdminFromEnv` em `src/db/postgres.ts`) cria ou sincroniza a conta administrativa na tabela `admins` armazenando apenas o hash seguro (`scrypt$<salt>$<hash>`).
3. Não existe cadastro público de administradores: visitantes comuns só acessam rotas públicas de leitura e envio de avaliação.

---

## 3. Como Instalar, Executar, Compilar e Testar

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Compilar e iniciar a aplicação completa (Angular + Express + PostgreSQL em `http://localhost:3000`):**
   ```bash
   npm run dev
   ```

3. **Executar em modo de desenvolvimento separado (Angular CLI com Proxy + API Express):**
   * Terminal 1 (Backend API na porta `3000`):
     ```bash
     npm run server
     ```
   * Terminal 2 (Angular Dev Server na porta `4200` com proxy para `/api`):
     ```bash
     npm start
     ```

4. **Compilar o build de produção do Angular (`dist/browser`):**
   ```bash
   npm run build
   ```

5. **Executar verificação de tipos (Lint TypeScript):**
   ```bash
   npm run lint
   ```

6. **Executar testes automatizados (Migrações, Preservação de Dados, Autenticação 401/200 e CRUD):**
   ```bash
   npm test
   ```

---

## 4. Arquitetura Técnica e Organização de Pastas

```text
sweetshop-v2/
├── angular.json                 # Configuração do Angular CLI (Bootstrap 5 + build)
├── proxy.conf.json              # Proxy de /api para http://localhost:3000 no ng serve
├── server.ts                    # Servidor Express + Rotas REST + Auth + Hospedagem SPA
├── index.html                   # HTML raiz (<app-root>) e fontes Google
├── .env.example                 # Modelo documentado de variáveis de ambiente
└── src/
    ├── main.ts                  # Bootstrap da aplicação Angular
    ├── index.css                # Variáveis e utilitários visuais Meu Doce + Bootstrap 5
    ├── types.ts                 # Modelos TypeScript e constantes da loja/encartes
    ├── auth/
    │   └── security.ts          # Hash scrypt, tokens HMAC-SHA256 e middleware requireAdminAuth
    ├── db/
    │   └── postgres.ts          # Conexão PostgreSQL, migrações versionadas e queries CRUD
    ├── utils/
    │   └── imageCanvas.ts       # Processamento HTML5 Canvas (500x500, 800x800, 700x900 px)
    ├── tests/
    │   └── api-auth-crud.test.ts# Suite de testes de API, segurança e banco de dados
    └── app/
        ├── app.component.ts     # Layout raiz (Header, RouterOutlet, Footer, Drawer, Modais)
        ├── app.config.ts        # Configuração de rotas e ZoneChangeDetection
        ├── app.routes.ts        # Definição das rotas ('', 'cardapio', 'admin')
        ├── guards/
        │   └── admin.guard.ts   # Guard de proteção de rota administrativa no frontend
        ├── services/
        │   └── store.service.ts # Estado reativo (Signals) de catálogo, carrinho e sessão admin
        ├── components/
        │   ├── header/          # Barra superior com links, carrinho e status Admin
        │   ├── footer/          # Rodapé institucional e créditos do desenvolvedor
        │   ├── cart-drawer/     # Carrinho lateral persistido em localStorage
        │   ├── feedback-section/# Mural de avaliações com rolagem interna e moderação Admin
        │   ├── store-map-section/# Google Maps integrado e canais WhatsApp, Instagram e iFood
        │   └── modals/          # Modais de Login Admin, Detalhes, CRUD Produto e Encartes
        └── pages/
            ├── home/            # Página Principal (/) institucional + Nossa Essência + Avaliações
            └── menu/            # Página Exclusiva do Cardápio (/cardapio) com filtros e CRUD
```

---

## 5. Modelo de Dados e Migrações Versionadas (PostgreSQL)

O banco de dados utiliza migrações não-destrutivas controladas pela tabela `schema_migrations`, preservando integralmente os registros existentes:

* **`schema_migrations` (`001_initial_schema`, `002_create_admins_table`):**
  * `version` (`TEXT PRIMARY KEY`), `applied_at` (`TIMESTAMP`)
* **`products`:**
  * `id`, `name`, `price`, `image_url`, `category` (`'Doces' | 'Salgados' | 'Bebidas'`), `image_size` (`'500x500' | '800x800' | '700x900'`), `description`, `manufactured_date`, `redirect_url`, `created_at`
* **`feedbacks`:**
  * `id`, `author_name`, `rating` (`1..5`), `comment`, `created_at`
* **`admins`:**
  * `id`, `username` (`UNIQUE`), `password_hash` (`scrypt`), `created_at`

---

## 6. Funcionalidades Principais

1. **Página Principal Institucional (`/`):**
   * **Hero Section:** apresentação editorial com logotipo circular oficial (`/assets/LOGO_465ec8e3.jpeg`), acesso rápido à página exclusiva `/cardapio`, atalho para iFood e abertura do carrinho.
   * **Seção "Nossa Essência" (`#essencia`):** apresentação das três linhas artesanais (**Doces, Salgados e Bebidas**) com visualização ampliada e download dos encartes oficiais (`CARDAPIO01`, `CARDAPIO02`, `CARDAPIO03`), sem o antigo bloco lateral do Instagram.
   * **Mural de Avaliações (`#avaliacoes`):** envio público de notas (1 a 5 estrelas) e comentários, exibido em área com altura limitada e rolagem interna (`max-height: 520px; overflow-y: auto`), com edição e exclusão restritas ao administrador autenticado.
   * **Localização e Contatos (`#contato`):** mapa interativo do Google Maps e cartões de contato direto via WhatsApp, Instagram e iFood.
2. **Página Exclusiva do Cardápio (`/cardapio`):**
   * Botão claro de retorno à página principal (`← Voltar para a página principal`).
   * Filtros combinados por categoria (`Doces`, `Salgados`, `Bebidas`, `Todos`), busca por texto e formato de imagem (`500x500`, `800x800`, `700x900 px`).
   * Persistência do carrinho em `localStorage` (`meudoce_cart_v1`) durante toda a navegação e recarregamento de página.
   * Botões de **Cadastrar Produto**, **Editar** e **Excluir** exibidos somente para administradores autenticados e protegidos no backend pelo middleware `requireAdminAuth`.
