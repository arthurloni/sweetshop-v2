import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import {
  IMAGE_SIZE_CONFIG,
  ImageSizeOption,
  Product,
  ProductCategory,
  STORE_INFO,
} from '../../../types';
import {
  createPatisserieSvgDataUri,
  downloadProductImage,
  processImageToAdaptiveSize,
} from '../../../utils/imageCanvas';

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- =======================================================================
         1. ADMINISTRATOR LOGIN MODAL (Requirement 4.3)
       ======================================================================= -->
    @if (store.isLoginModalOpen()) {
      <div class="modal-backdrop-custom" (click)="closeLoginModal()">
        <div
          class="bg-white rounded-4 border border-meudoce shadow-lg w-100 overflow-hidden"
          style="max-width: 440px;"
          (click)="$event.stopPropagation()"
        >
          <div
            class="d-flex align-items-center justify-content-between px-4 py-3 bg-meudoce-surface border-bottom border-meudoce"
          >
            <div>
              <span class="tracking-editorial text-meudoce-pink d-block">
                ACESSO RESTRITO
              </span>
              <h3 class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-0">
                Autenticação Administrativa
              </h3>
            </div>
            <button
              type="button"
              (click)="closeLoginModal()"
              class="btn btn-sm btn-outline-meudoce rounded-circle"
              style="width: 34px; height: 34px;"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <form (ngSubmit)="submitAdminLogin()" class="p-4">
            @if (loginError()) {
              <div class="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                {{ loginError() }}
              </div>
            }

            <div class="mb-3">
              <label class="form-label small fw-semibold text-meudoce-dark">
                Nome de usuário único
              </label>
              <input
                type="text"
                name="adminUsername"
                [ngModel]="loginUsername()"
                (ngModelChange)="loginUsername.set($event)"
                placeholder="Digite o usuário administrador"
                autocomplete="username"
                required
                class="form-control rounded-3"
              />
            </div>

            <div class="mb-4">
              <label class="form-label small fw-semibold text-meudoce-dark">
                Senha
              </label>
              <input
                type="password"
                name="adminPassword"
                [ngModel]="loginPassword()"
                (ngModelChange)="loginPassword.set($event)"
                placeholder="Digite sua senha"
                autocomplete="current-password"
                required
                class="form-control rounded-3"
              />
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                (click)="closeLoginModal()"
                class="btn btn-outline-meudoce rounded-pill px-4 py-2 small"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="isLoggingIn()"
                class="btn btn-meudoce rounded-pill px-4 py-2 small"
              >
                {{ isLoggingIn() ? 'Verificando...' : 'Entrar no Painel' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- =======================================================================
         2. PRODUCT DETAIL MODAL
       ======================================================================= -->
    @if (store.activeProductDetail(); as product) {
      <div class="modal-backdrop-custom" (click)="store.activeProductDetail.set(null)">
        <div
          class="bg-white rounded-4 border border-meudoce shadow-lg w-100 overflow-hidden my-4"
          style="max-width: 860px;"
          (click)="$event.stopPropagation()"
        >
          <div class="row g-0">
            <!-- Left: Adaptive Product Image -->
            <div
              class="col-12 col-md-6 bg-meudoce-surface p-4 d-flex flex-column align-items-center justify-content-center border-end border-meudoce"
            >
              <div
                class="w-100 rounded-4 overflow-hidden border border-meudoce bg-white shadow-sm"
                [ngClass]="getSizeConfig(product.imageSize).aspectClass"
                style="max-height: 420px;"
              >
                <img
                  [src]="product.imageUrl"
                  [alt]="product.name"
                  class="w-100 h-100 object-cover"
                />
              </div>

              <div
                class="mt-3 w-100 d-flex flex-wrap align-items-center justify-content-between gap-2 small text-meudoce-muted"
              >
                <span class="font-mono-tabular">
                  📐 Formato: {{ getSizeConfig(product.imageSize).label }}
                </span>

                <button
                  type="button"
                  (click)="handleDownload(product)"
                  class="btn btn-sm btn-outline-meudoce rounded-pill px-3 py-1"
                >
                  ⬇️ Baixar imagem
                </button>
              </div>
            </div>

            <!-- Right: Details & Purchase Controls -->
            <div class="col-12 col-md-6 p-4 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <p class="tracking-editorial text-meudoce-pink text-uppercase mb-1">
                      {{ product.category }} · {{ product.imageSize }} px
                    </p>
                    <h3 class="h3 font-serif-editorial fw-bold text-meudoce-dark mb-0">
                      {{ product.name }}
                    </h3>
                  </div>
                  <button
                    type="button"
                    (click)="store.activeProductDetail.set(null)"
                    class="btn btn-sm btn-outline-meudoce rounded-circle flex-shrink-0"
                    style="width: 34px; height: 34px;"
                    aria-label="Fechar detalhes"
                  >
                    ✕
                  </button>
                </div>

                <p class="fs-4 fw-bold text-meudoce-pink font-mono-tabular mt-2 mb-3">
                  {{ formatPrice(product.price) }}
                </p>

                <p class="small text-meudoce-muted mb-3">
                  {{
                    product.description ||
                      'Receita artesanal preparada diariamente com ingredientes selecionados na Meu Doce Doceria.'
                  }}
                </p>

                <div class="pt-3 border-top border-meudoce small text-meudoce-muted">
                  @if (product.manufacturedDate) {
                    <div class="mb-1">
                      📅 Data de fabricação:
                      <strong class="text-meudoce-dark font-mono-tabular">
                        {{ product.manufacturedDate }}
                      </strong>
                    </div>
                  }
                  <div>
                    🖼️ Resolução configurada:
                    <strong class="text-meudoce-dark font-mono-tabular">
                      {{ getSizeConfig(product.imageSize).width }} ×
                      {{ getSizeConfig(product.imageSize).height }} px
                    </strong>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-top border-meudoce">
                <!-- Quantity + Add to Cart -->
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div
                    class="d-flex align-items-center border border-meudoce rounded-pill bg-meudoce-surface px-2 py-1"
                  >
                    <button
                      type="button"
                      (click)="detailQty.set(detailQty() > 1 ? detailQty() - 1 : 1)"
                      class="btn btn-sm border-0 fw-bold"
                    >
                      -
                    </button>
                    <span class="px-2 small fw-bold font-mono-tabular">
                      {{ detailQty() }}
                    </span>
                    <button
                      type="button"
                      (click)="detailQty.set(detailQty() + 1)"
                      class="btn btn-sm border-0 fw-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    (click)="addDetailProductToCart(product)"
                    class="btn btn-meudoce rounded-pill py-2.5 px-4 small flex-grow-1"
                  >
                    🛍️ Salvar no carrinho
                  </button>
                </div>

                <!-- External Order Links -->
                <div class="row g-2">
                  <div class="col-12 col-sm-6">
                    <a
                      [href]="buildProductWhatsAppHref(product)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-outline-success w-100 rounded-pill py-2 small fw-semibold"
                    >
                      📱 Pedir no WhatsApp ↗
                    </a>
                  </div>
                  <div class="col-12 col-sm-6">
                    <a
                      [href]="storeInfo.ifoodUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-blush w-100 rounded-pill py-2 small"
                    >
                      Pedir pelo iFood ↗
                    </a>
                  </div>
                </div>

                <!-- Edit button visible ONLY if authenticated as Admin -->
                @if (store.isAuthenticated()) {
                  <div class="mt-3 pt-2 border-top border-meudoce">
                    <button
                      type="button"
                      (click)="editFromDetail(product)"
                      class="btn btn-link btn-sm text-meudoce-pink text-decoration-none p-0 fw-semibold"
                    >
                      ✏️ Editar postagem deste produto (Admin)
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- =======================================================================
         3. PRODUCT CREATE / EDIT MODAL (Restricted to Authenticated Admin)
       ======================================================================= -->
    @if (store.isProductFormOpen() && store.isAuthenticated()) {
      <div class="modal-backdrop-custom" (click)="closeProductForm()">
        <div
          class="bg-white rounded-4 border border-meudoce shadow-lg w-100 overflow-hidden my-4"
          style="max-width: 820px;"
          (click)="$event.stopPropagation()"
        >
          <div
            class="d-flex align-items-center justify-content-between px-4 py-3 bg-meudoce-surface border-bottom border-meudoce"
          >
            <div>
              <span class="tracking-editorial text-meudoce-pink d-block">
                PAINEL CRUD · POSTGRESQL
              </span>
              <h3 class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-0">
                {{
                  store.editingProduct()
                    ? 'Editar produto: ' + store.editingProduct()?.name
                    : 'Cadastrar novo item no cardápio'
                }}
              </h3>
            </div>
            <button
              type="button"
              (click)="closeProductForm()"
              class="btn btn-sm btn-outline-meudoce rounded-circle"
              style="width: 34px; height: 34px;"
              aria-label="Fechar janela"
            >
              ✕
            </button>
          </div>

          <form (ngSubmit)="submitProductForm()" class="p-4">
            @if (formError()) {
              <div class="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                {{ formError() }}
              </div>
            }

            <div class="row g-4">
              <!-- Left Column: Form Inputs -->
              <div class="col-12 col-md-7">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-meudoce-dark">
                    Nome do produto <span class="text-meudoce-pink">* (Obrigatório)</span>
                  </label>
                  <input
                    type="text"
                    name="prodName"
                    [ngModel]="formName()"
                    (ngModelChange)="formName.set($event)"
                    placeholder="Ex.: Copo da Felicidade de Morango"
                    required
                    class="form-control rounded-3 small"
                  />
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-meudoce-dark">
                      Preço (R$) <span class="text-meudoce-pink">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      min="0.50"
                      name="prodPrice"
                      [ngModel]="formPrice()"
                      (ngModelChange)="formPrice.set($event)"
                      placeholder="Ex.: 15.00"
                      required
                      class="form-control rounded-3 small font-mono-tabular"
                    />
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-semibold text-meudoce-dark">
                      Seção do cardápio
                    </label>
                    <select
                      name="prodCategory"
                      [ngModel]="formCategory()"
                      (ngModelChange)="formCategory.set($event)"
                      class="form-select rounded-3 small"
                    >
                      <option value="Doces">Doces</option>
                      <option value="Salgados">Salgados</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>
                  </div>
                </div>

                <!-- Adaptive Image Size Selector -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-meudoce-dark">
                    Padrão de tamanho adaptativo da imagem
                  </label>
                  <div class="row g-2">
                    @for (opt of sizeOptions; track opt) {
                      <div class="col-4">
                        <button
                          type="button"
                          (click)="changeImageSize(opt)"
                          class="btn w-100 text-start p-2 rounded-3 small"
                          [class.btn-blush]="formImageSize() === opt"
                          [class.btn-outline-meudoce]="formImageSize() !== opt"
                        >
                          <div class="fw-bold font-mono-tabular small">
                            {{ getSizeConfig(opt).shortLabel }}
                          </div>
                          <div class="text-truncate" style="font-size: 0.7rem;">
                            {{
                              opt === '500x500'
                                ? 'Quadrada (peq.)'
                                : opt === '800x800'
                                ? 'Quadrada (gde.)'
                                : 'Retrato vertical'
                            }}
                          </div>
                        </button>
                      </div>
                    }
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-meudoce-dark">
                    Descrição do produto
                  </label>
                  <textarea
                    rows="3"
                    name="prodDesc"
                    [ngModel]="formDescription()"
                    (ngModelChange)="formDescription.set($event)"
                    placeholder="Ingredientes, recheios e detalhes feitos com carinho..."
                    class="form-control rounded-3 small"
                  ></textarea>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-semibold text-meudoce-dark">
                      Data de fabricação
                    </label>
                    <input
                      type="date"
                      name="prodDate"
                      [ngModel]="formManufacturedDate()"
                      (ngModelChange)="formManufacturedDate.set($event)"
                      class="form-control rounded-3 small font-mono-tabular"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-semibold text-meudoce-dark">
                      Link externo (opcional)
                    </label>
                    <input
                      type="url"
                      name="prodRedirect"
                      [ngModel]="formRedirectUrl()"
                      (ngModelChange)="formRedirectUrl.set($event)"
                      placeholder="Padrão: WhatsApp/iFood"
                      class="form-control rounded-3 small"
                    />
                  </div>
                </div>
              </div>

              <!-- Right Column: Photo Upload & Adaptive Canvas Preview -->
              <div class="col-12 col-md-5">
                <div
                  class="bg-meudoce-surface rounded-4 p-3 border border-meudoce h-100 d-flex flex-column justify-content-between"
                >
                  <div>
                    <label class="form-label small fw-semibold text-meudoce-dark">
                      Foto do produto <span class="text-meudoce-pink">* (Obrigatório)</span>
                    </label>

                    <div class="d-grid gap-2 mb-3">
                      <label class="btn btn-meudoce rounded-3 py-2 small mb-0 cursor-pointer">
                        📤 Anexar foto do dispositivo
                        <input
                          type="file"
                          accept="image/*"
                          (change)="handleFileUpload($event)"
                          class="d-none"
                        />
                      </label>

                      <button
                        type="button"
                        (click)="generatePatisserieArt()"
                        class="btn btn-outline-meudoce rounded-3 py-2 small"
                      >
                        ✨ Gerar ilustração da confeitaria
                      </button>
                    </div>

                    <div class="d-flex justify-content-between small text-meudoce-muted mb-1">
                      <span>Pré-visualização adaptativa</span>
                      <span class="font-mono-tabular fw-bold text-meudoce-pink">
                        {{ getSizeConfig(formImageSize()).width }} ×
                        {{ getSizeConfig(formImageSize()).height }} px
                      </span>
                    </div>

                    <div
                      class="w-100 rounded-3 overflow-hidden bg-white border border-meudoce d-flex align-items-center justify-content-center"
                      [ngClass]="getSizeConfig(formImageSize()).aspectClass"
                      style="max-height: 230px;"
                    >
                      @if (formPreviewUrl()) {
                        <img
                          [src]="formPreviewUrl()"
                          [alt]="formName() || 'Prévia do produto'"
                          class="w-100 h-100 object-cover"
                        />
                      } @else {
                        <div class="text-center p-3 small text-meudoce-muted">
                          Nenhuma foto selecionada. Anexe uma foto ou clique em gerar ilustração.
                        </div>
                      }
                    </div>
                  </div>

                  <p class="small text-meudoce-muted mt-3 mb-0">
                    Todos os campos preenchidos acima serão exibidos no cardápio e no download da imagem.
                  </p>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 pt-3 mt-4 border-top border-meudoce">
              <button
                type="button"
                (click)="closeProductForm()"
                class="btn btn-outline-meudoce rounded-pill px-4 py-2 small"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="isSavingProduct()"
                class="btn btn-meudoce rounded-pill px-4 py-2 small"
              >
                {{
                  isSavingProduct()
                    ? 'Salvando no PostgreSQL...'
                    : store.editingProduct()
                    ? 'Salvar alterações'
                    : 'Publicar no cardápio'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- =======================================================================
         4. FULLSCREEN FLYER PREVIEW MODAL
       ======================================================================= -->
    @if (store.previewFlyerUrl(); as flyer) {
      <div class="modal-backdrop-custom" (click)="store.previewFlyerUrl.set(null)">
        <div
          class="bg-white rounded-4 border border-meudoce shadow-lg w-100 overflow-hidden"
          style="max-width: 540px;"
          (click)="$event.stopPropagation()"
        >
          <div
            class="d-flex align-items-center justify-content-between px-4 py-3 bg-meudoce-surface border-bottom border-meudoce"
          >
            <h4 class="h6 font-serif-editorial fw-bold text-meudoce-dark mb-0">
              {{ flyer.title }}
            </h4>
            <button
              type="button"
              (click)="store.previewFlyerUrl.set(null)"
              class="btn btn-sm btn-outline-meudoce rounded-circle"
              style="width: 32px; height: 32px;"
            >
              ✕
            </button>
          </div>
          <div class="p-3 bg-meudoce-surface text-center">
            <img
              [src]="flyer.url"
              [alt]="flyer.title"
              class="img-fluid rounded-3"
              style="max-height: 75vh; object-fit: contain;"
            />
          </div>
          <div class="px-4 py-3 bg-white border-top border-meudoce d-flex justify-content-between align-items-center">
            <span class="small text-meudoce-muted">{{ flyer.priceRange }}</span>
            <a
              [href]="flyer.url"
              download
              class="btn btn-sm btn-meudoce rounded-pill px-4"
            >
              ⬇️ Baixar encarte original
            </a>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalsComponent {
  readonly store = inject(StoreService);
  readonly storeInfo = STORE_INFO;
  readonly sizeOptions: ImageSizeOption[] = ['500x500', '800x800', '700x900'];

  // Login State
  readonly loginUsername = signal('');
  readonly loginPassword = signal('');
  readonly loginError = signal<string | null>(null);
  readonly isLoggingIn = signal(false);

  // Detail Modal State
  readonly detailQty = signal(1);

  // Product Form State
  readonly formName = signal('');
  readonly formPrice = signal('');
  readonly formCategory = signal<ProductCategory>('Doces');
  readonly formImageSize = signal<ImageSizeOption>('500x500');
  readonly formRawImage = signal('');
  readonly formPreviewUrl = signal('');
  readonly formDescription = signal('');
  readonly formManufacturedDate = signal(new Date().toISOString().slice(0, 10));
  readonly formRedirectUrl = signal('');
  readonly formError = signal<string | null>(null);
  readonly isSavingProduct = signal(false);

  constructor() {
    effect(() => {
      const editing = this.store.editingProduct();
      const isOpen = this.store.isProductFormOpen();
      if (!isOpen) return;

      if (editing) {
        this.formName.set(editing.name);
        this.formPrice.set(String(editing.price));
        this.formCategory.set(editing.category || 'Doces');
        this.formImageSize.set(editing.imageSize || '500x500');
        this.formRawImage.set(editing.imageUrl);
        this.formPreviewUrl.set(editing.imageUrl);
        this.formDescription.set(editing.description || '');
        this.formManufacturedDate.set(
          editing.manufacturedDate || new Date().toISOString().slice(0, 10)
        );
        this.formRedirectUrl.set(editing.redirectUrl || '');
        this.formError.set(null);
      } else {
        this.formName.set('');
        this.formPrice.set('');
        this.formCategory.set('Doces');
        this.formImageSize.set('500x500');
        this.formRawImage.set('');
        this.formPreviewUrl.set('');
        this.formDescription.set('');
        this.formManufacturedDate.set(new Date().toISOString().slice(0, 10));
        this.formRedirectUrl.set('');
        this.formError.set(null);
      }
    });

    effect(() => {
      const prod = this.store.activeProductDetail();
      if (prod) {
        this.detailQty.set(1);
      }
    });
  }

  getSizeConfig(size: ImageSizeOption) {
    return IMAGE_SIZE_CONFIG[size] || IMAGE_SIZE_CONFIG['500x500'];
  }

  formatPrice(val: number): string {
    return `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
  }

  // Login Handlers
  closeLoginModal(): void {
    this.store.isLoginModalOpen.set(false);
    this.loginError.set(null);
    this.loginPassword.set('');
  }

  async submitAdminLogin(): Promise<void> {
    this.loginError.set(null);
    if (!this.loginUsername().trim() || !this.loginPassword()) {
      this.loginError.set('Preencha usuário e senha.');
      return;
    }
    this.isLoggingIn.set(true);
    try {
      await this.store.loginAdmin(this.loginUsername().trim(), this.loginPassword());
      this.loginPassword.set('');
    } catch (err: any) {
      this.loginError.set(err.message || 'Credenciais inválidas.');
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  // Product Detail Handlers
  async handleDownload(product: Product): Promise<void> {
    await downloadProductImage(product);
  }

  addDetailProductToCart(product: Product): void {
    this.store.addToCart(product, this.detailQty());
  }

  buildProductWhatsAppHref(product: Product): string {
    if (product.redirectUrl && product.redirectUrl.trim() !== '') {
      return product.redirectUrl;
    }
    const priceStr = this.formatPrice(product.price);
    const msg = `Olá! Vi no site da Meu Doce Doceria Artesanal e gostaria de pedir:\n• ${this.detailQty()}x *${product.name}* (${priceStr} un.)`;
    return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  editFromDetail(product: Product): void {
    this.store.activeProductDetail.set(null);
    this.store.openEditProductModal(product);
  }

  // Product Form Handlers
  closeProductForm(): void {
    this.store.isProductFormOpen.set(false);
    this.store.editingProduct.set(null);
    this.formError.set(null);
  }

  async changeImageSize(size: ImageSizeOption): Promise<void> {
    this.formImageSize.set(size);
    if (this.formRawImage()) {
      try {
        const processed = await processImageToAdaptiveSize(this.formRawImage(), size);
        this.formPreviewUrl.set(processed);
      } catch {
        this.formPreviewUrl.set(this.formRawImage());
      }
    }
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        this.formRawImage.set(reader.result);
        this.formError.set(null);
        try {
          const processed = await processImageToAdaptiveSize(
            reader.result,
            this.formImageSize()
          );
          this.formPreviewUrl.set(processed);
        } catch {
          this.formPreviewUrl.set(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  }

  async generatePatisserieArt(): Promise<void> {
    const titleForArt = this.formName().trim() || 'Doce Artesanal';
    const cat = this.formCategory();
    const theme =
      cat === 'Salgados' ? 'savory' : cat === 'Bebidas' ? 'coffee' : 'strawberry';
    const uri = createPatisserieSvgDataUri(titleForArt, cat, theme);
    this.formRawImage.set(uri);
    this.formError.set(null);
    try {
      const processed = await processImageToAdaptiveSize(uri, this.formImageSize());
      this.formPreviewUrl.set(processed);
    } catch {
      this.formPreviewUrl.set(uri);
    }
  }

  async submitProductForm(): Promise<void> {
    this.formError.set(null);
    const parsedPrice = Number(String(this.formPrice()).replace(',', '.'));
    if (!this.formName().trim()) {
      this.formError.set('O campo Nome é obrigatório.');
      return;
    }
    if (!this.formPrice() || isNaN(parsedPrice) || parsedPrice <= 0) {
      this.formError.set('O campo Preço é obrigatório e deve ser maior que zero.');
      return;
    }
    const finalImage = this.formPreviewUrl() || this.formRawImage();
    if (!finalImage) {
      this.formError.set('A Foto do produto é obrigatória. Anexe uma foto ou gere uma ilustração.');
      return;
    }

    this.isSavingProduct.set(true);
    try {
      await this.store.saveProduct({
        name: this.formName().trim(),
        price: parsedPrice,
        imageUrl: finalImage,
        category: this.formCategory(),
        imageSize: this.formImageSize(),
        description: this.formDescription().trim(),
        manufacturedDate: this.formManufacturedDate(),
        redirectUrl: this.formRedirectUrl().trim(),
      });
      this.closeProductForm();
    } catch (err: any) {
      this.formError.set(err.message || 'Erro ao salvar produto.');
    } finally {
      this.isSavingProduct.set(false);
    }
  }
}
