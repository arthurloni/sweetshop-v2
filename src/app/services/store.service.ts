import { Injectable, computed, signal } from '@angular/core';
import {
  AdminUser,
  CartItem,
  Feedback,
  FlyerMenuItem,
  ImageSizeOption,
  OfficialFlyer,
  Product,
  ProductCategory,
} from '../../types';

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
    ? ''
    : 'https://SUA-URL-DO-RENDER';

const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;

const CART_STORAGE_KEY = 'meudoce_cart_v1';
const SESSION_TOKEN_KEY = 'meudoce_admin_token_v1';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  // Catalog, Flyer Menu Lines & Feedbacks State
  readonly products = signal<Product[]>([]);
  readonly flyerItems = signal<FlyerMenuItem[]>([]);
  readonly feedbacks = signal<Feedback[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorBanner = signal<string | null>(null);

  // Menu Filtering State
  readonly selectedCategory = signal<'Doces' | 'Salgados' | 'Bebidas' | 'Todos'>('Doces');
  readonly selectedSizeFilter = signal<'Todos' | ImageSizeOption>('Todos');
  readonly searchQuery = signal<string>('');

  readonly filteredProducts = computed(() => {
    const prods = this.products();
    const cat = this.selectedCategory();
    const size = this.isAuthenticated() ? this.selectedSizeFilter() : 'Todos';
    const q = this.searchQuery().trim().toLowerCase();

    return prods.filter((item) => {
      const matchesCat = cat === 'Todos' || item.category === cat;
      const matchesSize = size === 'Todos' || item.imageSize === size;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCat && matchesSize && matchesSearch;
    });
  });

  // Administrator Authentication State (never stores passwords in browser cache)
  readonly currentAdmin = signal<AdminUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentAdmin() !== null);
  readonly isLoginModalOpen = signal<boolean>(false);

  // Modals & Drawers State
  readonly isProductFormOpen = signal<boolean>(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly activeProductDetail = signal<Product | null>(null);
  readonly previewFlyerUrl = signal<OfficialFlyer | null>(null);

  // Shopping Cart State (persisted in localStorage across navigation & reload)
  readonly cartItems = signal<CartItem[]>(this.loadInitialCart());
  readonly isCartOpen = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  readonly totalCartCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalCartAmount = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    )
  );

  constructor() {
    this.fetchAllData();
    this.verifySessionWithServer();
  }

  private loadInitialCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private persistCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }

  private getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extraHeaders };
    try {
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Ignore sessionStorage errors
    }
    return headers;
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 3000);
  }

  async fetchAllData(): Promise<void> {
    this.isLoading.set(true);
    this.errorBanner.set(null);
    try {
      const [prodRes, fbRes, flyerRes] = await Promise.all([
        fetch(apiUrl('/api/products')),
        fetch(apiUrl('/api/feedbacks')),
        fetch(apiUrl('/api/flyer-items')),
      ]);
      if (!prodRes.ok) throw new Error('Não foi possível carregar o cardápio.');
      if (!fbRes.ok) throw new Error('Não foi possível carregar as avaliações.');
      if (!flyerRes.ok) throw new Error('Não foi possível carregar os encartes oficiais.');

      const prodsData: Product[] = await prodRes.json();
      const fbsData: Feedback[] = await fbRes.json();
      const flyersData: FlyerMenuItem[] = await flyerRes.json();
      this.products.set(prodsData);
      this.feedbacks.set(fbsData);
      this.flyerItems.set(flyersData);
    } catch (err: any) {
      this.errorBanner.set(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================
  async verifySessionWithServer(): Promise<boolean> {
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        this.currentAdmin.set(null);
        this.selectedSizeFilter.set('Todos');
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        return false;
      }
      const data = await res.json();
      if (data.authenticated && data.admin) {
        this.currentAdmin.set(data.admin);
        return true;
      }
      this.currentAdmin.set(null);
      return false;
    } catch {
      this.currentAdmin.set(null);
      return false;
    }
  }

  async loginAdmin(username: string, password: string): Promise<void> {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Falha na autenticação.');
    }
    if (data.token) {
      try {
        sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
      } catch {
        // Ignore sessionStorage errors
      }
    }
    this.currentAdmin.set(data.admin);
    this.isLoginModalOpen.set(false);
    this.showToast(`Bem-vinda(o), ${data.admin.username}! Modo administrativo ativo.`);
  }

  async logoutAdmin(): Promise<void> {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
    } finally {
      try {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
      } catch {
        // Ignore
      }
      this.currentAdmin.set(null);
      this.selectedSizeFilter.set('Todos');
      this.isProductFormOpen.set(false);
      this.editingProduct.set(null);
      this.showToast('Sessão administrativa encerrada com segurança.');
    }
  }

  // ============================================================================
  // SHOPPING CART METHODS
  // ============================================================================
  addToCart(product: Product, quantity = 1): void {
    const current = this.cartItems();
    const existing = current.find((i) => i.product.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = current.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      updated = [...current, { product, quantity }];
    }
    this.cartItems.set(updated);
    this.persistCart(updated);
    this.showToast(`"${product.name}" salvo no carrinho!`);
  }

  updateCartQty(productId: number, delta: number): void {
    const updated = this.cartItems()
      .map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);
    this.cartItems.set(updated);
    this.persistCart(updated);
  }

  removeFromCart(productId: number): void {
    const updated = this.cartItems().filter((item) => item.product.id !== productId);
    this.cartItems.set(updated);
    this.persistCart(updated);
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.persistCart([]);
  }

  // ============================================================================
  // PRODUCT CRUD METHODS (Protected by Admin Auth)
  // ============================================================================
  openCreateProductModal(): void {
    if (!this.isAuthenticated()) {
      this.isLoginModalOpen.set(true);
      return;
    }
    this.editingProduct.set(null);
    this.isProductFormOpen.set(true);
  }

  openEditProductModal(product: Product): void {
    if (!this.isAuthenticated()) {
      this.isLoginModalOpen.set(true);
      return;
    }
    this.editingProduct.set(product);
    this.isProductFormOpen.set(true);
  }

  async saveProduct(input: {
    name: string;
    price: number;
    imageUrl: string;
    category: ProductCategory;
    imageSize: ImageSizeOption;
    description: string;
    manufacturedDate: string;
    redirectUrl: string;
  }): Promise<void> {
    const editing = this.editingProduct();
    if (editing) {
      const res = await fetch(apiUrl(`/api/products/${editing.id}`), {
        method: 'PUT',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          this.currentAdmin.set(null);
          this.isLoginModalOpen.set(true);
        }
        throw new Error(data.error || 'Falha ao atualizar produto.');
      }
      this.products.update((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      const updatedCart = this.cartItems().map((item) =>
        item.product.id === data.id ? { ...item, product: data } : item
      );
      this.cartItems.set(updatedCart);
      this.persistCart(updatedCart);
      this.showToast(`Produto "${data.name}" atualizado com sucesso!`);
    } else {
      const res = await fetch(apiUrl('/api/products'), {
        method: 'POST',
        headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          this.currentAdmin.set(null);
          this.isLoginModalOpen.set(true);
        }
        throw new Error(data.error || 'Falha ao cadastrar produto.');
      }
      this.products.update((prev) => [data, ...prev]);
      this.selectedCategory.set(data.category);
      this.showToast(`Novo produto "${data.name}" publicado no cardápio!`);
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!this.isAuthenticated()) {
      this.isLoginModalOpen.set(true);
      return;
    }
    const res = await fetch(apiUrl(`/api/products/${product.id}`), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    if (res.status === 401) {
      this.currentAdmin.set(null);
      this.isLoginModalOpen.set(true);
      this.showToast('Sessão expirada. Faça login novamente.');
      return;
    }
    if (res.ok) {
      this.products.update((prev) => prev.filter((p) => p.id !== product.id));
      this.removeFromCart(product.id);
      this.showToast(`Produto "${product.name}" removido do cardápio.`);
    }
  }

  // ============================================================================
  // OFFICIAL MENU BOARD LINES (FLYER ITEMS) CRUD METHODS (Admin Auth)
  // ============================================================================
  async addFlyerItem(input: {
    category: ProductCategory;
    name: string;
    price: number;
  }): Promise<void> {
    const res = await fetch(apiUrl('/api/flyer-items'), {
      method: 'POST',
      headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        this.currentAdmin.set(null);
        this.isLoginModalOpen.set(true);
      }
      throw new Error(data.error || 'Erro ao adicionar linha no encarte.');
    }
    this.flyerItems.update((prev) => [...prev, data]);
    this.showToast(`Linha "${data.name}" adicionada ao encarte de ${data.category}!`);
  }

  async updateFlyerItem(
    id: number,
    input: {
      category?: ProductCategory;
      name: string;
      price: number;
    }
  ): Promise<void> {
    const res = await fetch(apiUrl(`/api/flyer-items/${id}`), {
      method: 'PUT',
      headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        this.currentAdmin.set(null);
        this.isLoginModalOpen.set(true);
      }
      throw new Error(data.error || 'Erro ao atualizar linha do encarte.');
    }
    this.flyerItems.update((prev) => prev.map((item) => (item.id === id ? data : item)));
    this.showToast(`Linha "${data.name}" atualizada no encarte!`);
  }

  async deleteFlyerItem(id: number): Promise<void> {
    const res = await fetch(apiUrl(`/api/flyer-items/${id}`), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) {
        this.currentAdmin.set(null);
        this.isLoginModalOpen.set(true);
      }
      this.showToast('Acesso restrito a administradores.');
      return;
    }
    this.flyerItems.update((prev) => prev.filter((item) => item.id !== id));
    this.showToast('Linha removida do encarte com sucesso.');
  }

  // ============================================================================
  // FEEDBACKS METHODS (Public creation, Admin-only edit & delete)
  // ============================================================================
  async addFeedback(input: {
    authorName: string;
    rating: number;
    comment: string;
  }): Promise<void> {
    const res = await fetch(apiUrl('/api/feedbacks'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao publicar avaliação.');
    }
    this.feedbacks.update((prev) => [data, ...prev]);
    this.showToast('Sua avaliação foi publicada! Muito obrigada pelo carinho.');
  }

  async updateFeedback(
    id: number,
    input: { authorName: string; rating: number; comment: string }
  ): Promise<void> {
    const res = await fetch(apiUrl(`/api/feedbacks/${id}`), {
      method: 'PUT',
      headers: this.getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        this.currentAdmin.set(null);
        this.isLoginModalOpen.set(true);
      }
      throw new Error(data.error || 'Não autorizado para editar avaliação.');
    }
    this.feedbacks.update((prev) => prev.map((f) => (f.id === id ? data : f)));
    this.showToast('Comentário atualizado pela administração.');
  }

  async deleteFeedback(id: number): Promise<void> {
    const res = await fetch(apiUrl(`/api/feedbacks/${id}`), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) {
        this.currentAdmin.set(null);
        this.isLoginModalOpen.set(true);
      }
      this.showToast('Acesso restrito a administradores.');
      return;
    }
    this.feedbacks.update((prev) => prev.filter((f) => f.id !== id));
    this.showToast('Comentário removido pela administração.');
  }
}
