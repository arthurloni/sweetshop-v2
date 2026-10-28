# Meu Doce — Doceria Artesanal (Vitrine Interativa & CRUD PostgreSQL)

Plataforma web interativa centrada no usuário (UCD) para a **Meu Doce — Doceria Artesanal** (Rua 4 de Janeiro, 780 — Jardim Leblon, Cuiabá - MT), seguindo fielmente a estética editorial em branco e rosa-antigo (`#C86D88`) do design de referência enviado, combinada ao fluxo estrutural do protótipo, cardápio real completo (**Doces, Salgados e Bebidas**), carrinho de compras, mural de feedbacks, Google Maps e CRUD com persistência PostgreSQL.

## Revisão do Usuário & Decisões Críticas

> [!IMPORTANT]
> O plano foi atualizado para incorporar todas as imagens de referência, a logo oficial, as 3 páginas do cardápio real, a inspiração do Instagram e o protótipo estrutural. Clique em **Proceed** para iniciarmos a implementação do código.

- **Identidade Visual & Estética de Referência (Incorporado)**:
  - Paleta **Branco & Rosa Antigo/Confeitaria (`#C86D88` / `#B85A75`)** com fundos circulares suaves em rosa-blush (`#FCEEF2`) e tipografia editorial serifada (`Playfair Display`) com destaque em itálico (*"Um doce momento muda o seu dia."*) exatamente como na sua referência visual (`image_7652ad12.png`).
  - Uso direto da **Logo Oficial** (`/assets/aistudio/LOGO_465ec8e3.jpeg`) tanto no cabeçalho quanto no destaque circular da Hero com o selo flutuante *"Um carinho em forma de doce"*.
- **Cardápio Oficial Pré-Cadastrado no PostgreSQL (Incorporado)**:
  - Todos os itens reais das imagens `CARDAPIO01` (**Doces**), `CARDAPIO02` (**Salgados**) e `CARDAPIO03` (**Bebidas**) já virão cadastrados no banco de dados com seus preços oficiais (ex.: *Copos da felicidade R$ 15,00*, *Bolos no pote R$ 15,00*, *Fatia Brownie R$ 18,00*, *Trufas R$ 4,50*, *Empadas R$ 10,00*, *Torta Fria R$ 15,00*, *Chocolate Quente R$ 18,00*, etc.), além de uma galeria dedicada para visualizar/baixar os 3 encartes originais do cardápio e inspiração do perfil `@meudoce_doceriaartesanal`.
- **Estrutura Híbrida (Referência Visual + Protótipo)**:
  - Navegação fluida contemplando **Produtos / Destaques**, **Cardápio (Doces, Salgados, Bebidas)**, **Nossa Essência / Avaliações**, **Localização (Google Maps — Rua 4 de Janeiro, 780, Jardim Leblon)**, **Contatos (WhatsApp, Instagram, iFood)** e o bloco de **Informações do Criador do Site (Arthur Loni — Desenvolvedor de Software, GitHub e LinkedIn)**.

---

## 1. Visão Geral & Conceito Principal

- **O Que Faz**: Oferece aos clientes da *Meu Doce Doceria* uma experiência acolhedora e interativa para navegar pelos doces, salgados e bebidas, visualizar fotos nos 3 formatos padronizados (`500x500`, `800x800` e `700x900 px`), baixar a foto de qualquer doce, montar pedidos no carrinho para envio automático no WhatsApp `(65) 99342-4125` ou pedir pelo iFood, avaliar os produtos com estrelas e comentários, e localizar a loja física no Jardim Leblon. Para a administradora, entrega um sistema CRUD completo ligado ao PostgreSQL para cadastrar novos itens, editar preços/fotos rapidamente e moderar comentários.
- **Público-Alvo / Personas**:
  - **Clientes em Cuiabá - MT**: Desejam ver fotos reais dos doces (encomendas e pronta entrega), conferir preços atualizados, salvar itens no carrinho e pedir pelo WhatsApp ou iFood com 1 clique.
  - **Administradora (Prima)**: Precisa adicionar novos doces do dia, atualizar preços ou corrigir qualquer postagem errada em segundos, escolhendo o tamanho adaptativo da foto.

---

## 2. Experiência do Usuário & Design Visual

### Identidade Visual & Tema (Fiel à Referência Enviada)

- **Direção Estética**: *Confeitaria Artesanal Editorial* — exatamente alinhada ao layout de referência (`image_7652ad12.png`), combinando fundo branco puro (`#FFFFFF`) e creme rosado (`#FFF9FB`), formas orgânicas circulares em rosa pastel (`#FCEEF2`), detalhes de brilho minimalistas (`*`) e botões em **Rosa Antigo / Malva (`#C86D88`)**.
- **Paleta de Cores (60-30-10)**:
  - **60% Base Luminosa**: Branco puro (`#FFFFFF`) e fundo suave de seção (`#FDF8F9`).
  - **30% Superfícies & Contraste Tipográfico**: Rosa-blush suave (`#FCEEF2`) para círculos decorativos e fundos de filtro, bordas delicadas (`#F3DCE2`), títulos em marrom-café escuro (`#23191C`) e textos de apoio em cinza-quente (`#6E5D63`).
  - **10% Acento Principal (Rosa Meu Doce)**: `#C86D88` (hover `#B55975`) aplicado nos botões primários (*"Conheça o cardápio"*, *"Peça pelo WhatsApp"*, abas ativas *"Doces" / "Salgados" / "Bebidas"* e selo *"Um carinho em forma de doce"*).
- **Tipografia & Hierarquia**:
  - *Títulos & Hero (`Playfair Display`)*: Fonte serifada clássica com suporte a itálico expressivo em rosa (`muda o seu dia.`, `Um carinho em forma de doce`, `Nosso cardápio`).
  - *Interface, Subtítulos & Cardápio (`Plus Jakarta Sans`)*: Sans-serif limpa para navegação, subtítulos em caixa-alta espaçada (`FEITO COM CARINHO EM CUIABÁ`, `ESCOLHA O SEU FAVORITO`) e descrições.
  - *Preços & Medidas (`tabular-nums`)*: Alinhamento numérico perfeito para os valores em reais (`R$ 15,00`, `R$ 4,50`) e dimensões (`500×500 px`, `800×800 px`, `700×900 px`).

### Fluxos Principais do Usuário & Seções da Aplicação

1. **Cabeçalho & Menu Rápido (Inspirado na Referência + Protótipo)**:
   - Marca à esquerda com a logo circular oficial (`/assets/aistudio/LOGO_465ec8e3.jpeg`) + título **Meu Doce** (*DOCERIA ARTESANAL*).
   - Navegação central/lateral de fácil acesso para **Produtos & Cardápio**, **Nossa Essência (Instagram & Encartes)**, **Avaliações**, **Localização & Contatos** e alternância para o **Painel Admin (CRUD)** + botão do **Carrinho** e **Peça pelo WhatsApp**.
2. **Hero Section ("Um doce momento *muda o seu dia.*")**:
   - Coluna esquerda com o selo `FEITO COM CARINHO EM CUIABÁ`, título principal, subtítulo *"Doces artesanais, bolos, salgados e muito amor em cada receita. Escolha seus favoritos e faça seu pedido com a gente."*, botões **Conheça o cardápio** e **Peça pelo iFood ↗**, e indicador de localização com ícone de coração: *Encomendas e pronta entrega · Rua 4 de Janeiro, 780 · Jardim Leblon · Cuiabá - MT*.
   - Coluna direita com a composição circular da logo oficial (`/assets/aistudio/LOGO_465ec8e3.jpeg`), círculos suaves em rosa-blush e o selo circular inclinado *"Um carinho em forma de doce"*.
3. **Vitrine de Produtos & Cardápio Completo (CRUD Dinâmico)**:
   - Abas interativas **Doces**, **Salgados**, **Bebidas** e **Todos**, além de filtro por formato de imagem:
     - **Quadrada (pequena)**: `500 x 500 px`
     - **Quadrada (grande)**: `800 x 800 px`
     - **Retrato**: `700 x 900 px`
   - Cada card exibe a foto na proporção selecionada, **Nome**, **Preço**, **Descrição**, **Data de Fabricação**, botão de **Salvar no Carrinho**, botão de **Baixar Imagem do Doce** (na dimensão exata) e, quando o modo Administradora está ativo, botões diretos de **Editar** e **Excluir**.
   - Ao clicar no produto, abre-se o modal detalhado com redirecionamento direto para encomendar o item no **WhatsApp** (`(65) 99342-4125`) ou no **iFood**.
   - Inclui também um visualizador dos **3 Encartes Oficiais do Cardápio** (`CARDAPIO01`, `CARDAPIO02`, `CARDAPIO03`) para clientes que queiram consultar ou baixar a arte tradicional.
4. **Mural Exclusivo de Feedbacks & Vitrine Instagram**:
   - Seção inspirada no perfil `@meudoce_doceriaartesanal` (91 posts · 393 seguidores · Bolos, Doces & Muito amor) ao lado do mural interativo onde clientes deixam sua avaliação (1 a 5 estrelas + comentário).
   - A administradora pode **editar** ou **apagar** qualquer comentário diretamente na interface.
5. **Localização (Google Maps) & Contatos Rápidos (Fiel ao Protótipo)**:
   - Mapa interativo do Google Maps focado na **Rua 4 de Janeiro, 780 — Jardim Leblon, Cuiabá - MT**, acompanhado do botão para abrir a rota oficial (`https://maps.app.goo.gl/Y231nSyVK74WC6yr9`).
   - Barra de contatos destacados com os botões oficiais de **WhatsApp** (`(65) 99342-4125`), **Instagram** (`@meudoce_doceriaartesanal`) e **iFood** (loja *Meu Doce Doceria Artesanal - Jardim Leblon*).
6. **Créditos do Criador do Site**:
   - Seção dedicada e elegante exibindo **Arthur Loni** — *Desenvolvedor de Software*, com links diretos para o [GitHub](https://github.com/arthurloni) e [LinkedIn](https://www.linkedin.com/in/arthur-loni-7b90a62b8).

---

## 3. Decisões de Produto & Trade-Offs

- **Decisão 1: Semente Completa com o Cardápio Real da Loja**
  - *Abordagem Escolhida*: Popular o banco PostgreSQL inicialmente com os produtos reais extraídos das imagens `CARDAPIO01`, `CARDAPIO02` e `CARDAPIO03` (incluindo *Copos da felicidade*, *Bolos no pote*, *Mini pudim*, *Brownie Tradicional e Recheado*, *Fatia Brownie*, *Potinhos da felicidade*, *Docinhos*, *Pão de Mel*, *Cone Trufado*, *Coxinhas de morango*, *Bombons*, *Fatias*, *Pavê*, *Trufas*, *Salgados assados*, *Empadas*, *Torta Fria de frango* e *Bebidas*).
  - *Por quê*: Garante que o site já nasça 100% útil para a sua prima com os dados reais do comércio dela, permitindo testar imediatamente a edição, adição e exclusão no banco de dados.
- **Decisão 2: Redimensionamento Real em Canvas para `500x500`, `800x800` e `700x900 px`**
  - *Abordagem Escolhida*: Tanto no upload/cadastro do produto quanto na função de baixar a imagem do doce, um utilitário HTML5 Canvas processa a foto exatamente para `500×500`, `800×800` ou `700×900` pixels com corte central inteligente (`object-fit: cover`).
  - *Por quê*: Cumpre rigorosamente o requisito 4.5 da documentação sem distorcer as fotos tiradas pelo celular.

---

## 4. Arquitetura Técnica & Estratégia de Dados

### Diagrama de Arquitetura & Componentes

```
┌──────────────────────────────────────────────────────────────────────────────┐
│           FRONTEND REACT — IDENTIDADE "MEU DOCE" (#C86D88 & BRANCO)          │
│                                                                              │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌───────────────┐  │
│  │ Header & Menu Rápido   │  │ Hero Editorial          │  │ Carrinho      │  │
│  │ • Logo Oficial         │  │ • "Um doce momento..."  │  │ Slide-Over    │  │
│  │ • Produtos / Cardápio  │  │ • Selo Circular Rosa    │  │ • Subtotal R$ │  │
│  │ • Contatos / Admin     │  │ • CTA Cardápio & iFood  │  │ • WhatsApp    │  │
│  └───────────┬────────────┘  └────────────┬────────────┘  └───────▲───────┘  │
│              │                            │                       │          │
│              ▼                            ▼                       │          │
│  ┌────────────────────────────────────────────────────────────────┴───────┐  │
│  │         Vitrine & Cardápio CRUD (Doces | Salgados | Bebidas)           │  │
│  │  • Padrões de Imagem: 500x500 px | 800x800 px | 700x900 px             │  │
│  │  • Campos Obrigatórios: Foto, Preço e Nome (+ Descrição e Fabricação)  │  │
│  │  • Ações Cliente: Ver Detalhes/Redirecionar, Salvar Carrinho, Baixar   │  │
│  │  • Ações Admin: Cadastrar Novo Item, Editar Postagem, Excluir Item     │  │
│  └────────────────────────────────────┬───────────────────────────────────┘  │
│                                       │                                      │
│  ┌────────────────────────────────────┼───────────────────────────────────┐  │
│  │   Mural de Feedbacks & Instagram   │   Google Maps, Contatos & Autor   │  │
│  │  • Estrelas (1-5) + Comentários    │  • Mapa: Rua 4 de Janeiro, 780    │  │
│  │  • Moderação Admin (Editar/Apagar) │  • Botões: WhatsApp, Insta, iFood │  │
│  │  • Preview @meudoce_doceria...     │  • Autor: Arthur Loni (GitHub/In) │  │
│  └──────────────────┬─────────────────┴─────────────────┬─────────────────┘  │
└─────────────────────┼───────────────────────────────────┼────────────────────┘
                      │ API REST (/api/products, /api/feedbacks)
                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     SERVIDOR EXPRESS + BANCO POSTGRESQL                      │
│                                                                              │
│  • Tabela `products`: id, name, price, category ('Doces'|'Salgados'|         │
│    'Bebidas'), image_url, image_size ('500x500'|'800x800'|'700x900'),        │
│    description, manufactured_date, redirect_url, created_at                  │
│  • Tabela `feedbacks`: id, author_name, rating (1..5), comment, created_at   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Ativos Visuais Locais Integrados

- `/assets/aistudio/LOGO_465ec8e3.jpeg`: Logo oficial da *Meu Doce — Doceria Artesanal* aplicada na Navbar, no Hero e no Rodapé.
- `/assets/aistudio/CARDAPIO01_1efd2637.jpeg`, `/assets/aistudio/CARDAPIO02_e94365ca.jpeg`, `/assets/aistudio/CARDAPIO03_9fa23d90.jpeg`: Encartes ofinais de Doces, Salgados e Bebidas disponíveis para visualização em tela cheia e download.
- `/assets/aistudio/PERFIL-INSTA_feec39bc.jpeg`: Referência visual na seção do Instagram `@meudoce_doceriaartesanal`.
