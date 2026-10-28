# Meu Doce — Confeitaria Artesanal

Plataforma web interativa e centrada no usuário (UCD) para a **Meu Doce — Confeitaria Artesanal**. O projeto adota uma identidade visual editorial em tons de branco e rosa antigo (`#C86D88`), estruturada com cardápio completo (**Doces, Salgados e Bebidas**), carrinho de compras, mural de avaliações, integração com Google Maps e operações de CRUD completas integradas ao PostgreSQL.

---

## Como executar o projeto (VS Code)

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 1. Visão Geral e Conceito

* **O que a aplicação faz:** oferece aos clientes uma experiência intuitiva para explorar itens do cardápio, visualizar imagens em dimensões padronizadas (`500x500`, `800x800` e `700x900 px`), baixar fotos dos produtos, montar carrinhos e enviar pedidos diretamente via WhatsApp ou iFood. Permite também avaliar itens com notas de 1 a 5 estrelas e comentários.
* **Painel Administrativo:** disponibiliza controle CRUD conectado ao PostgreSQL para cadastrar produtos, atualizar preços, ajustar fotos e moderar feedbacks enviados pela comunidade.
* **Público-Alvo:**
  * **Clientes:** buscam praticidade para consultar preços atualizados, conferir fotos reais dos produtos e fechar pedidos de forma rápida via WhatsApp ou iFood.
  * **Administrador:** gerencia o catálogo em tempo real, atualizando valores, descrições e mídias sem necessidade de alterações manuais no banco de dados.

---

## 2. Experiência do Usuário e Design Visual

### Identidade Visual e Estilo

* **Direção de Arte:** linha editorial para confeitaria artesanal, combinando fundos em branco puro (`#FFFFFF`) e off-white rosado (`#FFF9FB`), formas orgânicas circulares em tom blush (`#FCEEF2`) e botões em rosa antigo/mauve (`#C86D88`).
* **Distribuição de Cores (Regra 60-30-10):**
  * **60% (Base clara):** branco puro (`#FFFFFF`) e fundos de seção suaves (`#FDF8F9`).
  * **30% (Superfícies e Contraste):** rosa blush (`#FCEEF2`) para destaques circulares e filtros; bordas sutis (`#F3DCE2`); títulos em marrom café escuro (`#23191C`); e textos de apoio em cinza quente (`#6E5D63`).
  * **10% (Destaque Principal):** rosa Meu Doce (`#C86D88`, hover: `#B55975`) aplicado em botões primários (**Explorar Cardápio**, **Pedir via WhatsApp**) e abas ativas.
* **Tipografia:**
  * **Títulos e Hero:** `Playfair Display` (serifada clássica, com itálicos destacados).
  * **Interface e Textos:** `Plus Jakarta Sans` (sem serifa, limpa e legível).
  * **Preços e Métricas:** alinhamento numérico com `tabular-nums` para valores em reais (`R$ 15,00`, `R$ 4,50`) e dimensões (`500×500 px`).

---

### Principais Fluxos e Seções

1. **Cabeçalho e Menu Rápido:** logotipo oficial, links de navegação para seções da página, acesso ao painel administrativo e botão flutuante para o carrinho de compras.
2. **Hero Section:** mensagem de destaque institucional (*"Um momento doce pode mudar o seu dia"*), botão de ação para o cardápio e integração com link do iFood.
3. **Catálogo de Produtos e Cardápio (CRUD Dinâmico):**
   * Filtros por categoria (**Doces**, **Salgados**, **Bebidas**, **Todos**) e formato de exibição (`500x500`, `800x800`, `700x900 px`).
   * Cards com imagem, nome, descrição, data de fabricação, preço, botão de download da imagem tratada e adição ao carrinho.
   * Visualizador embutido dos panfletos originais do cardápio (`CARDAPIO01`, `CARDAPIO02`, `CARDAPIO03`).
4. **Mural de Feedbacks:** sistema interativo para envio de avaliações com nota e comentário, com moderação de edição/exclusão pelo painel de administração.
5. **Localização e Contato:** visualização integrada via Google Maps com atalhos diretos para WhatsApp, Instagram e iFood.

---

## 3. Decisões de Projeto e Trade-offs

* **Povoamento Inicial (Seed) com Dados Reais:**
  * **Abordagem:** inserção dos itens reais do cardápio físico (copos da felicidade, fatias de brownie, empadas, tortas e bebidas) logo na inicialização do PostgreSQL.
  * **Motivação:** valida as operações de banco em ambiente real de homologação e evita o uso de dados genéricos (*lorem ipsum*).
* **Processamento de Imagens com Canvas API:**
  * **Abordagem:** redimensionamento dinâmico via HTML5 Canvas no momento do upload/download para as resoluções fixas `500x500`, `800x800` e `700x900 px` utilizando corte central inteligente (`object-fit: cover`).
  * **Motivação:** garante padronização visual no frontend sem distorcer fotos tiradas diretamente de smartphones.

---

## 4. Arquitetura Técnica

### Diagrama de Componentes

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│             FRONTEND REACT — IDENTIDADE "MEU DOCE" (#C86D88 & BRANCO)        │
│                                                                              │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌───────────────┐ │
│  │ Cabeçalho & Menu       │  │ Hero Editorial          │  │ Carrinho      │ │
│  │ • Logo Oficial         │  │ • Taglines de Destaque  │  │ • Slide-Over  │ │
│  │ • Navegação / Produtos │  │ • Badges Visuais        │  │ • Subtotal    │ │
│  │ • Contato / Admin      │  │ • CTAs Cardápio / iFood │  │ • WhatsApp    │ │
│  └───────────┬────────────┘  └────────────┬────────────┘  └───────▲───────┘ │
│              │                            │                       │         │
│              ▼                            ▼                       │         │
│  ┌────────────────────────────────────────────────────────────────┴───────┐ │
│  │                   Catálogo de Produtos & CRUD                          │ │
│  │                   (Doces | Salgados | Bebidas)                         │ │
│  │ • Formatos: 500x500 px | 800x800 px | 700x900 px                       │ │
│  │ • Dados: Imagem, Preço, Nome, Descrição e Data de Fabricação           │ │
│  │ • Ações do Usuário: Ver Detalhes, Carrinho, Download de Imagem         │ │
│  │ • Ações Admin: Inserir, Atualizar e Deletar Itens                      │ │
│  └────────────────────────────────────┬────────────────────────────────────┘ │
│                                       │                                    │
│  ┌────────────────────────────────────┼───────────────────────────────────┐ │
│  │ Mural de Avaliações                │ Localização & Contatos            │ │
│  │ • Notas (1–5) e Comentários        │ • Google Maps integrado           │ │
│  │ • Moderação Admin (Editar/Excluir) │ • WhatsApp, Instagram, iFood      │ │
│  └──────────────────┬─────────────────┴─────────────────┬─────────────────┘ │
└─────────────────────┼───────────────────────────────────┼───────────────────┘
                      │ API REST (/api/products, /api/feedbacks)
                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND EXPRESS + BANCO POSTGRESQL                        │
│                                                                              │
│ • Tabela `products`: id, name, price, category ('Doces'|'Salgados'|          │
│   'Bebidas'), image_url, image_size, description, manufactured_date          │
│ • Tabela `feedbacks`: id, author_name, rating, comment, created_at           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Recursos Visuais Integrados

* `LOGO_465ec8e3.jpeg`: logotipo oficial da marca aplicado na barra de navegação, hero e rodapé.
* `CARDAPIO01`, `CARDAPIO02`, `CARDAPIO03`: artes originais do cardápio para consulta e download em alta resolução.
* `PERFIL-INSTA_feec39bc.jpeg`: elemento de composição da seção social.