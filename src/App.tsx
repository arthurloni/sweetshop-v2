/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Heart,
  ShoppingBag,
  Plus,
  Edit3,
  Trash2,
  Download,
  ExternalLink,
  Search,
  Calendar,
  Settings,
  Github,
  Linkedin,
  Code2,
  Eye,
  X,
} from 'lucide-react';
import {
  CartItem,
  Feedback,
  IMAGE_SIZE_CONFIG,
  ImageSizeOption,
  Product,
  ProductCategory,
  STORE_INFO,
} from './types.ts';
import { downloadProductImage } from './utils/imageCanvas.ts';
import { ProductFormModal } from './components/ProductFormModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FeedbackSection } from './components/FeedbackSection.tsx';
import { StoreMapSection } from './components/StoreMapSection.tsx';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Filtering & Navigation State
  const [selectedCategory, setSelectedCategory] = useState<'Doces' | 'Salgados' | 'Bebidas' | 'Todos'>('Doces');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<'Todos' | ImageSizeOption>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin & Modals State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [previewFlyerUrl, setPreviewFlyerUrl] = useState<{ title: string; url: string } | null>(null);

  // Shopping Cart State (persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('meudoce_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('meudoce_cart_v1', JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Load initial data from PostgreSQL backend
  const fetchAllData = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const [prodRes, fbRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/feedbacks'),
      ]);
      if (!prodRes.ok) throw new Error('Não foi possível carregar o cardápio.');
      if (!fbRes.ok) throw new Error('Não foi possível carregar as avaliações.');

      const prodsData: Product[] = await prodRes.json();
      const fbsData: Feedback[] = await fbRes.json();
      setProducts(prodsData);
      setFeedbacks(fbsData);
    } catch (err: any) {
      setErrorBanner(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCat =
        selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchesSize =
        selectedSizeFilter === 'Todos' || item.imageSize === selectedSizeFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCat && matchesSize && matchesSearch;
    });
  }, [products, selectedCategory, selectedSizeFilter, searchQuery]);

  // Cart handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`"${product.name}" salvo no carrinho!`);
  };

  const handleUpdateCartQty = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // CRUD Product Handlers (PostgreSQL)
  const handleSaveProduct = async (input: {
    name: string;
    price: number;
    imageUrl: string;
    category: ProductCategory;
    imageSize: ImageSizeOption;
    description: string;
    manufacturedDate: string;
    redirectUrl: string;
  }) => {
    if (editingProduct) {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao atualizar produto.');
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      // Also update in cart if present
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === data.id ? { ...item, product: data } : item
        )
      );
      showToast(`Produto "${data.name}" atualizado com sucesso!`);
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao cadastrar produto.');
      setProducts((prev) => [data, ...prev]);
      setSelectedCategory(data.category);
      showToast(`Novo produto "${data.name}" publicado no cardápio!`);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      handleRemoveFromCart(product.id);
      showToast(`Produto "${product.name}" removido do cardápio.`);
    }
  };

  // Feedback Handlers (PostgreSQL)
  const handleAddFeedback = async (input: {
    authorName: string;
    rating: number;
    comment: string;
  }) => {
    const res = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedbacks((prev) => [data, ...prev]);
      showToast('Sua avaliação foi publicada! Muito obrigada pelo carinho.');
    }
  };

  const handleUpdateFeedback = async (
    id: number,
    input: { authorName: string; rating: number; comment: string }
  ) => {
    const res = await fetch(`/api/feedbacks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? data : f)));
      showToast('Comentário atualizado pela administradora.');
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    const res = await fetch(`/api/feedbacks/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast('Comentário removido pela administradora.');
    }
  };

  const officialMenuFlyers = [
    {
      title: 'Cardápio Oficial — Doces',
      subtitle: 'Copos da felicidade, Bolos no pote, Brownies, Docinhos, Trufas e Fatias',
      url: '/assets/aistudio/CARDAPIO01_1efd2637.jpeg',
    },
    {
      title: 'Cardápio Oficial — Salgados',
      subtitle: 'Salgados assados, Empada carne seca, Empada de frango e Torta fria',
      url: '/assets/aistudio/CARDAPIO02_e94365ca.jpeg',
    },
    {
      title: 'Cardápio Oficial — Bebidas',
      subtitle: 'Sucos naturais, Cafés especiais, Capuccino, Chocolate quente e Refrigerantes',
      url: '/assets/aistudio/CARDAPIO03_9fa23d90.jpeg',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#23191C]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#23191C] text-white px-5 py-3 rounded-full shadow-lg text-xs font-medium flex items-center gap-2.5 border border-[#C86D88]/40">
          <Heart className="w-4 h-4 text-[#C86D88] fill-current shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          TOP NAVIGATION BAR (Strict 3-Zone Contract + Reference Aesthetic)
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F3DCE2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="text-xl font-serif-editorial font-bold tracking-tight text-[#23191C] whitespace-nowrap shrink-0"
          >
            Meu Doce
          </a>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#3D2E33]">
            <a
              href="#cardapio"
              className="hover:text-[#C86D88] transition-colors whitespace-nowrap shrink-0"
            >
              Cardápio
            </a>
            <a
              href="#essencia"
              className="hover:text-[#C86D88] transition-colors whitespace-nowrap shrink-0"
            >
              Nossa essência
            </a>
            <a
              href="#avaliacoes"
              className="hover:text-[#C86D88] transition-colors whitespace-nowrap shrink-0"
            >
              Avaliações
            </a>
            <a
              href="#contato"
              className="hover:text-[#C86D88] transition-colors whitespace-nowrap shrink-0"
            >
              Contato
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
                'Olá! Vim pelo site da Meu Doce Doceria Artesanal e gostaria de fazer um pedido.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#C86D88] rounded-full hover:bg-[#B55975] transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Peça pelo WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ===================================================================
            HERO SECTION (Matching image_7652ad12.png Reference Design)
           =================================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs font-bold tracking-[0.22em] text-[#C86D88]">
                  FEITO COM CARINHO EM CUIABÁ
                </p>

                <h1 className="font-serif-editorial text-[#23191C] text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[1.08] tracking-tight text-balance">
                  Um doce
                  <br />
                  momento
                  <br />
                  <span className="italic font-normal text-[#C86D88]">
                    muda o seu dia.
                  </span>
                </h1>

                <p className="text-[#6E5D63] text-base md:text-lg leading-relaxed max-w-lg">
                  Doces artesanais, bolos, salgados e muito amor em cada receita.
                  Escolha seus favoritos e faça seu pedido com a gente.
                </p>

                {/* Primary Hero Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#cardapio"
                    className="px-7 py-3.5 rounded-full bg-[#C86D88] text-white text-sm font-semibold hover:bg-[#B55975] transition-all shadow-sm whitespace-nowrap shrink-0"
                  >
                    Conheça o cardápio
                  </a>

                  <a
                    href={STORE_INFO.ifoodUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#23191C] hover:text-[#C86D88] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Peça pelo iFood</span>
                    <span className="text-[#C86D88]">↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFF9FB] border border-[#F3DCE2] text-xs font-semibold text-[#23191C] hover:border-[#C86D88] transition-colors whitespace-nowrap shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#C86D88]" />
                    <span>Carrinho ({totalCartCount})</span>
                  </button>
                </div>

                {/* Location & Delivery Info Indicator */}
                <div className="pt-6 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#FCEEF2] flex items-center justify-center text-[#C86D88] shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6E5D63]">
                      Encomendas e pronta entrega
                    </p>
                    <p className="text-xs font-bold text-[#23191C]">
                      Rua 4 de Janeiro, 780 · Jardim Leblon · Cuiabá - MT
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Official Circular Logo & Soft Blush Composition */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                {/* Soft Blush Decorative Circle Backdrop */}
                <div
                  className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#FCEEF2]/80 absolute -top-6 right-2 md:right-6 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Minimal Sparkle Asterisks matching reference */}
                <span
                  className="absolute top-12 right-16 text-[#C86D88] text-2xl font-serif select-none pointer-events-none"
                  aria-hidden="true"
                >
                  ✳
                </span>
                <span
                  className="absolute bottom-14 left-10 text-[#C86D88]/60 text-xl font-serif select-none pointer-events-none"
                  aria-hidden="true"
                >
                  ✳
                </span>

                {/* Main Logo Circle */}
                <div className="relative z-10 w-72 h-72 md:w-[360px] md:h-[360px] rounded-full bg-white p-3.5 shadow-xl border border-[#F3DCE2]">
                  <div className="w-full h-full rounded-full overflow-hidden border border-[#F3DCE2] bg-[#FADADD]">
                    <img
                      src="/assets/aistudio/LOGO_465ec8e3.jpeg"
                      alt="Logo Oficial Meu Doce — Doceria Artesanal"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Floating Tilted Circle Badge ("Um carinho em forma de doce") */}
                  <div className="absolute -bottom-2 -right-4 md:right-0 w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#C86D88] text-white flex items-center justify-center p-4 text-center shadow-lg transform rotate-6">
                    <span className="font-serif-editorial italic text-sm md:text-base leading-snug">
                      Um carinho em forma de doce
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            INTERACTIVE MENU & POSTGRESQL CRUD SECTION (#cardapio)
           =================================================================== */}
        <section id="cardapio" className="py-16 md:py-20 bg-white border-t border-[#F3DCE2]/60">
          <div className="max-w-6xl mx-auto px-6">
            {/* Section Title matching reference */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C86D88] mb-2">
                ESCOLHA O SEU FAVORITO
              </p>
              <h2 className="text-3xl md:text-5xl font-serif-editorial text-[#23191C]">
                Nosso cardápio
              </h2>
              <p className="mt-3 text-sm md:text-base text-[#6E5D63]">
                Receitas artesanais preparadas para deixar qualquer pausa mais gostosa.
              </p>
            </div>

            {/* Category Filter Buttons (Doces | Salgados | Bebidas | Todos) */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {(['Doces', 'Salgados', 'Bebidas', 'Todos'] as const).map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#C86D88] text-white shadow-xs'
                        : 'bg-white text-[#4A3B40] border border-[#F3DCE2] hover:border-[#C86D88]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Workspace Toolbar: Search, Adaptive Size Filter, Cart & Admin CRUD Controls */}
            <div className="bg-[#FFF9FB] rounded-2xl p-4 border border-[#F3DCE2] mb-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Left: Search + Adaptive Dimension Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-[#6E5D63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar doce, salgado ou bebida..."
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#F3DCE2] text-xs focus:outline-none focus:border-[#C86D88]"
                  />
                </div>

                {/* Adaptive Image Size Filter (500x500, 800x800, 700x900) */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#F3DCE2] overflow-x-auto">
                  <span className="text-[11px] font-medium text-[#6E5D63] pl-2.5 pr-1 whitespace-nowrap">
                    Formato:
                  </span>
                  {(['Todos', '500x500', '800x800', '700x900'] as const).map((sizeOpt) => {
                    const active = selectedSizeFilter === sizeOpt;
                    return (
                      <button
                        key={sizeOpt}
                        type="button"
                        onClick={() => setSelectedSizeFilter(sizeOpt)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono-tabular transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#FCEEF2] text-[#C86D88]'
                            : 'text-[#6E5D63] hover:text-[#23191C]'
                        }`}
                      >
                        {sizeOpt === 'Todos' ? 'Todos' : `${sizeOpt}px`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Admin CRUD Toggle & New Product Button */}
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdminMode((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                    isAdminMode
                      ? 'bg-[#23191C] text-white border-[#23191C]'
                      : 'bg-white text-[#23191C] border-[#F3DCE2] hover:border-[#C86D88]'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-[#C86D88]" />
                  {isAdminMode ? 'Modo Administradora: Ativo' : 'Gerenciar Cardápio (Admin)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Produto
                </button>
              </div>
            </div>

            {errorBanner && (
              <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
                <span>{errorBanner}</span>
                <button
                  type="button"
                  onClick={fetchAllData}
                  className="underline font-semibold ml-4"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="rounded-3xl border border-[#F3DCE2] bg-[#FFF9FB] p-4 h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#FFF9FB] rounded-3xl border border-[#F3DCE2] p-8">
                <p className="text-lg font-serif-editorial font-semibold text-[#23191C]">
                  Nenhum produto encontrado neste filtro
                </p>
                <p className="text-xs text-[#6E5D63] mt-1">
                  Experimente mudar a categoria ou cadastre um novo doce no botão acima.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 items-start">
                {filteredProducts.map((product) => {
                  const sizeConfig =
                    IMAGE_SIZE_CONFIG[product.imageSize] || IMAGE_SIZE_CONFIG['500x500'];
                  const formattedPrice = `R$ ${Number(product.price)
                    .toFixed(2)
                    .replace('.', ',')}`;

                  return (
                    <article
                      key={product.id}
                      className="group bg-white rounded-3xl border border-[#F3DCE2] hover:border-[#C86D88] transition-all duration-150 hover:-translate-y-0.5 shadow-xs overflow-hidden flex flex-col"
                    >
                      {/* Adaptive Image Container (Clicking directs customer to Product Detail / Destination) */}
                      <div
                        onClick={() => setActiveProductDetail(product)}
                        className={`cursor-pointer w-full ${sizeConfig.aspectClass} bg-[#FFF9FB] overflow-hidden relative border-b border-[#F3DCE2]`}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>

                      {/* Card Body: Displays all product fields (Nome, Preço, Descrição, Data de fabricação, Dimensão) */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          {/* Unboxed clean metadata with typographic separators */}
                          <div className="flex items-center gap-1.5 text-xs text-[#6E5D63]">
                            <span className="uppercase tracking-wider font-semibold text-[#C86D88]">
                              {product.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">
                              {sizeConfig.shortLabel}
                            </span>
                            {product.manufacturedDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 font-mono-tabular">
                                  <Calendar className="w-3 h-3 text-[#C86D88]" />
                                  {product.manufacturedDate}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between gap-3 mt-1.5">
                            <h3
                              onClick={() => setActiveProductDetail(product)}
                              className="cursor-pointer text-lg font-serif-editorial font-bold text-[#23191C] group-hover:text-[#C86D88] transition-colors"
                            >
                              {product.name}
                            </h3>
                            <span className="text-base font-bold text-[#C86D88] font-mono-tabular shrink-0">
                              {formattedPrice}
                            </span>
                          </div>

                          <p className="text-xs text-[#6E5D63] leading-relaxed mt-2 line-clamp-2">
                            {product.description ||
                              'Preparado artesanalmente na Meu Doce Doceria.'}
                          </p>
                        </div>

                        {/* Customer & Administrator Actions */}
                        <div className="pt-3 border-t border-[#F3DCE2] space-y-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product, 1)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors whitespace-nowrap shrink-0"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Salvar no carrinho
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadProductImage(product)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-full bg-[#FFF9FB] border border-[#F3DCE2] text-[#23191C] text-xs font-semibold hover:border-[#C86D88] hover:text-[#C86D88] transition-colors whitespace-nowrap shrink-0"
                              title={`Baixar imagem do doce (${sizeConfig.shortLabel})`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar</span>
                            </button>
                          </div>

                          {/* Quick Edit / Delete Row for CRUD testing & validation */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                              }}
                              className="inline-flex items-center gap-1 font-medium text-[#6E5D63] hover:text-[#C86D88] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar postagem</span>
                            </button>

                            {isAdminMode ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product)}
                                className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveProductDetail(product)}
                                className="inline-flex items-center gap-1 font-semibold text-[#C86D88] hover:underline"
                              >
                                <span>Comprar / Detalhes</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================================
            NOSSA ESSÊNCIA, ENCARTES DO CARDÁPIO & INSTAGRAM (#essencia)
           =================================================================== */}
        <section id="essencia" className="py-20 bg-[#FFF9FB] border-t border-[#F3DCE2]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: Official Menu Boards (CARDAPIO 01, 02, 03) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#C86D88] mb-2">
                    NOSSA ESSÊNCIA & ENCARTES OFICIAIS
                  </p>
                  <h2 className="text-3xl md:text-4xl font-serif-editorial text-[#23191C]">
                    Tradição artesanal em cada detalhe
                  </h2>
                  <p className="mt-2 text-sm text-[#6E5D63] leading-relaxed">
                    Consulte ou baixe também as versões completas dos nossos encartes de Doces, Salgados e Bebidas da Meu Doce Doceria.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {officialMenuFlyers.map((flyer) => (
                    <div
                      key={flyer.url}
                      className="bg-white rounded-2xl border border-[#F3DCE2] overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div
                        onClick={() => setPreviewFlyerUrl(flyer)}
                        className="cursor-pointer aspect-[9/16] bg-[#FAF3F5] overflow-hidden relative group"
                      >
                        <img
                          src={flyer.url}
                          alt={flyer.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-white text-[#23191C] text-xs font-semibold inline-flex items-center gap-1 shadow-md">
                            <Eye className="w-3.5 h-3.5 text-[#C86D88]" />
                            Ampliar
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#23191C] truncate">
                          {flyer.title.replace('Cardápio Oficial — ', '')}
                        </span>
                        <a
                          href={flyer.url}
                          download
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#C86D88] hover:underline shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Official Instagram Profile Inspiration (@meudoce_doceriaartesanal) */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl border border-[#F3DCE2] p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="/assets/aistudio/LOGO_465ec8e3.jpeg"
                        alt="Logo Meu Doce"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-[#F3DCE2]"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#23191C]">
                          {STORE_INFO.instagramHandle}
                        </h3>
                        <p className="text-xs text-[#6E5D63]">
                          Confeitaria artesanal · Bolos, Doces & Muito amor
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-[#F3DCE2] max-h-[380px]">
                    <img
                      src="/assets/aistudio/PERFIL-INSTA_feec39bc.jpeg"
                      alt="Perfil Oficial do Instagram Meu Doce Doceria Artesanal"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <a
                    href={STORE_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors"
                  >
                    Acompanhar novidades no Instagram
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            EXCLUSIVE CUSTOMER FEEDBACKS SECTION (#avaliacoes)
           =================================================================== */}
        <FeedbackSection
          feedbacks={feedbacks}
          isAdminMode={isAdminMode}
          onAddFeedback={handleAddFeedback}
          onUpdateFeedback={handleUpdateFeedback}
          onDeleteFeedback={handleDeleteFeedback}
        />

        {/* ===================================================================
            GOOGLE MAPS STORE LOCATION & CONTACTS SECTION (#contato)
           =================================================================== */}
        <StoreMapSection />
      </main>

      {/* =====================================================================
          FOOTER & DISCREET CREATOR CREDIT SECTION (Seção 4.3 Documentação)
         ===================================================================== */}
      <footer className="bg-white border-t border-[#F3DCE2] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#F3DCE2]">
            <div className="flex items-center gap-3.5">
              <img
                src="/assets/aistudio/LOGO_465ec8e3.jpeg"
                alt="Meu Doce Doceria Artesanal"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-[#F3DCE2]"
              />
              <div>
                <p className="font-serif-editorial font-bold text-lg text-[#23191C]">
                  Meu Doce — Doceria Artesanal
                </p>
                <p className="text-xs text-[#6E5D63]">
                  {STORE_INFO.address} · WhatsApp: {STORE_INFO.whatsappDisplay}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#6E5D63]">
              <a href="#cardapio" className="hover:text-[#C86D88] transition-colors">
                Cardápio
              </a>
              <a href="#essencia" className="hover:text-[#C86D88] transition-colors">
                Encartes Oficiais
              </a>
              <a href="#avaliacoes" className="hover:text-[#C86D88] transition-colors">
                Avaliações
              </a>
              <a href="#contato" className="hover:text-[#C86D88] transition-colors">
                Localização
              </a>
            </div>
          </div>

          {/* Discreet Creator Credit Section (Requirement 4.3: "Uma pequena seção discreta com o GitHub, o nome e a profissão do criador") */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E5D63]">
            <p>© {new Date().getFullYear()} Meu Doce Doceria Artesanal. Todos os direitos reservados.</p>

            <div className="flex flex-wrap items-center gap-3 bg-[#FFF9FB] px-4 py-2 rounded-full border border-[#F3DCE2]">
              <span className="inline-flex items-center gap-1.5 text-[#23191C] font-medium">
                <Code2 className="w-3.5 h-3.5 text-[#C86D88]" />
                <span>Desenvolvido por</span>
                <strong>{STORE_INFO.creator.name}</strong>
                <span aria-hidden="true">·</span>
                <span className="text-[#6E5D63]">{STORE_INFO.creator.role}</span>
              </span>

              <span className="text-[#F3DCE2]" aria-hidden="true">
                |
              </span>

              <div className="flex items-center gap-3">
                <a
                  href={STORE_INFO.creator.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#23191C] hover:text-[#C86D88] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>

                <a
                  href={STORE_INFO.creator.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#23191C] hover:text-[#C86D88] transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          MODALS & DRAWERS
         ===================================================================== */}
      <ProductFormModal
        isOpen={isFormOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <ProductDetailModal
        product={activeProductDetail}
        onClose={() => setActiveProductDetail(null)}
        onAddToCart={handleAddToCart}
        onEditProduct={(prod) => {
          setEditingProduct(prod);
          setIsFormOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
      />

      {/* Fullscreen Flyer Preview Modal */}
      {previewFlyerUrl && (
        <div
          onClick={() => setPreviewFlyerUrl(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#F3DCE2] max-w-lg w-full overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFF9FB] border-b border-[#F3DCE2]">
              <h4 className="text-sm font-serif-editorial font-bold text-[#23191C]">
                {previewFlyerUrl.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewFlyerUrl(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#F3DCE2] flex items-center justify-center text-[#6E5D63] hover:text-[#23191C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto flex justify-center bg-[#FAF3F5]">
              <img
                src={previewFlyerUrl.url}
                alt={previewFlyerUrl.title}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
