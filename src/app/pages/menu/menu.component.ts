import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../services/store.service';
import {
  IMAGE_SIZE_CONFIG,
  ImageSizeOption,
  Product,
} from '../../../types';
import { downloadProductImage } from '../../../utils/imageCanvas';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="py-5 bg-white">
      <div class="container">
        <!-- Clear Navigation Back to Home Page (Requirement 4.2) -->
        <div
          class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-meudoce"
        >
          <a
            routerLink="/"
            class="btn btn-sm btn-outline-meudoce rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2"
          >
            
            <span>Voltar para a página principal</span>
          </a>

          <div class="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              (click)="store.isCartOpen.set(true)"
              class="btn btn-sm btn-blush rounded-pill px-3 py-2"
            >
              Ver Carrinho ({{ store.totalCartCount() }})
            </button>

            <!-- Admin Actions strictly restricted to authenticated administrators (Requirement 4.2 & 4.3) -->
            @if (store.isAuthenticated()) {
              <button
                type="button"
                (click)="store.openCreateProductModal()"
                class="btn btn-sm btn-meudoce rounded-pill px-3 py-2"
              >
                Cadastrar Produto
              </button>
            } @else {
              <button
                type="button"
                (click)="store.isLoginModalOpen.set(true)"
                class="btn btn-sm btn-outline-meudoce rounded-pill px-3 py-2"
              >
                🔒 Login Admin para Gerenciar
              </button>
            }
          </div>
        </div>

        <!-- Menu Page Title -->
        <div class="text-center mx-auto mb-4" style="max-width: 660px;">
          <p class="tracking-editorial text-meudoce-pink text-uppercase mb-1">
            ESCOLHA O SEU FAVORITO
          </p>
          <h1 class="display-5 font-serif-editorial fw-bold text-meudoce-dark">
            Nosso cardápio completo
          </h1>
          <p class="text-meudoce-muted small mt-2 mb-0">
            Explore doces artesanais, salgados assados e bebidas especiais. Clique em qualquer item para ver detalhes, baixar a foto ou adicionar ao seu pedido.
          </p>
        </div>

        <!-- Category Filter Buttons (Doces | Salgados | Bebidas | Todos) -->
        <div class="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
          @for (cat of categories; track cat) {
            <button
              type="button"
              (click)="store.selectedCategory.set(cat)"
              class="btn rounded-pill px-4 py-2 small"
              [class.btn-meudoce]="store.selectedCategory() === cat"
              [class.btn-outline-meudoce]="store.selectedCategory() !== cat"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Toolbar: Search & Adaptive Size Filter -->
        <div
          class="bg-meudoce-surface rounded-4 p-3 border border-meudoce mb-4 d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3"
        >
          <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3 flex-grow-1">
            <div class="flex-grow-1" style="max-width: 340px;">
              <input
                type="search"
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.searchQuery.set($event)"
                placeholder="Buscar doce, salgado ou bebida..."
                class="form-control form-control-sm rounded-pill px-3 py-2"
              />
            </div>

            @if (store.isAuthenticated()) {
              <!-- Adaptive Image Size Filter (Apenas Administrador) -->
              <div
                class="d-flex align-items-center gap-1 bg-white p-1 rounded-pill border border-meudoce overflow-auto"
              >
                <span class="small fw-semibold text-meudoce-muted ps-2 pe-1">
                  Formato:
                </span>
                @for (sizeOpt of sizeFilters; track sizeOpt) {
                  <button
                    type="button"
                    (click)="store.selectedSizeFilter.set(sizeOpt)"
                    class="btn btn-sm rounded-pill px-2.5 py-1 font-mono-tabular"
                    style="font-size: 0.75rem;"
                    [class.btn-blush]="store.selectedSizeFilter() === sizeOpt"
                    [class.border-0]="store.selectedSizeFilter() !== sizeOpt"
                  >
                    {{ sizeOpt === 'Todos' ? 'Todos' : sizeOpt + 'px' }}
                  </button>
                }
              </div>
            }
          </div>

          <div class="d-flex align-items-center justify-content-between justify-content-lg-end gap-2">
            <span class="small text-meudoce-muted font-mono-tabular">
              {{ store.filteredProducts().length }} itens exibidos
            </span>

            @if (store.isAuthenticated()) {
              <span class="badge rounded-pill bg-dark text-white px-3 py-2">
                🔒 Modo Administrador ({{ store.currentAdmin()?.username }})
              </span>
            }
          </div>
        </div>

        @if (store.errorBanner()) {
          <div
            class="alert alert-danger rounded-4 d-flex align-items-center justify-content-between small mb-4"
          >
            <span>{{ store.errorBanner() }}</span>
            <button
              type="button"
              (click)="store.fetchAllData()"
              class="btn btn-sm btn-outline-danger rounded-pill"
            >
              Tentar novamente
            </button>
          </div>
        }

        <!-- Product Grid -->
        @if (store.isLoading()) {
          <div class="row g-4">
            @for (n of [1, 2, 3, 4, 5, 6]; track n) {
              <div class="col-12 col-sm-6 col-lg-4">
                <div
                  class="rounded-4 border border-meudoce bg-meudoce-surface p-4"
                  style="height: 380px;"
                ></div>
              </div>
            }
          </div>
        } @else if (store.filteredProducts().length === 0) {
          <div
            class="text-center py-5 bg-meudoce-surface rounded-4 border border-meudoce p-4"
          >
            <p class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-1">
              Nenhum produto encontrado neste filtro
            </p>
            <p class="small text-meudoce-muted mb-0">
              Experimente mudar a categoria ou limpar a busca acima.
            </p>
          </div>
        } @else {
          <div class="row g-4 align-items-start">
            @for (product of store.filteredProducts(); track product.id) {
              <div class="col-12 col-sm-6 col-lg-4">
                <article class="card-meudoce d-flex flex-column h-100">
                  <!-- Adaptive Image Container -->
                  <div
                    (click)="store.activeProductDetail.set(product)"
                    class="w-100 bg-meudoce-surface overflow-hidden border-bottom border-meudoce"
                    [ngClass]="getSizeConfig(product.imageSize).aspectClass"
                    style="cursor: pointer;"
                  >
                    <img
                      [src]="product.imageUrl"
                      [alt]="product.name"
                      class="w-100 h-100 object-cover"
                    />
                  </div>

                  <!-- Card Body -->
                  <div class="p-4 flex-grow-1 d-flex flex-column justify-content-between gap-3">
                    <div>
                      <div class="d-flex align-items-center flex-wrap gap-1 small text-meudoce-muted">
                        <span class="text-uppercase fw-bold text-meudoce-pink">
                          {{ product.category }}
                        </span>
                        @if (store.isAuthenticated()) {
                          <span>·</span>
                          <span class="font-mono-tabular">
                            {{ getSizeConfig(product.imageSize).shortLabel }}
                          </span>
                        }
                        @if (product.manufacturedDate) {
                          <span>·</span>
                          <span class="font-mono-tabular">
                            Fabricado em {{ product.manufacturedDate }}
                          </span>
                        }
                      </div>

                      <div class="d-flex align-items-baseline justify-content-between gap-2 mt-2">
                        <h2
                          (click)="store.activeProductDetail.set(product)"
                          class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-0"
                          style="cursor: pointer;"
                        >
                          {{ product.name }}
                        </h2>
                        <span class="fw-bold text-meudoce-pink font-mono-tabular flex-shrink-0">
                          {{ formatPrice(product.price) }}
                        </span>
                      </div>

                      <p class="small text-meudoce-muted mt-2 mb-0 line-clamp-2">
                        {{
                          product.description ||
                            'Preparado artesanalmente na Meu Doce Doceria.'
                        }}
                      </p>
                    </div>

                    <!-- Customer & Admin Actions -->
                    <div class="pt-3 border-top border-meudoce">
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <button
                          type="button"
                          (click)="store.addToCart(product, 1)"
                          class="btn btn-sm btn-meudoce rounded-pill py-2 px-3 flex-grow-1"
                        >
                          Salvar no carrinho
                        </button>

                        <button
                          type="button"
                          (click)="handleDownload(product)"
                          class="btn btn-sm btn-outline-meudoce rounded-pill py-2 px-3"
                          [title]="'Baixar imagem (' + getSizeConfig(product.imageSize).shortLabel + ')'"
                        >
                          Baixar foto
                        </button>
                      </div>

                      <div class="d-flex align-items-center justify-content-between pt-1 small">
                        <button
                          type="button"
                          (click)="store.activeProductDetail.set(product)"
                          class="btn btn-link btn-sm text-meudoce-pink text-decoration-none p-0 fw-semibold"
                        >
                          Comprar / Detalhes
                        </button>

                        <!-- Edit & Delete actions strictly available ONLY to authenticated admins -->
                        @if (store.isAuthenticated()) {
                          <div class="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              (click)="store.openEditProductModal(product)"
                              class="btn btn-link btn-sm text-meudoce-dark text-decoration-none p-0 fw-medium"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              (click)="store.deleteProduct(product)"
                              class="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-medium"
                            >
                              Excluir
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class MenuComponent {
  readonly store = inject(StoreService);
  readonly categories = ['Doces', 'Salgados', 'Bebidas', 'Todos'] as const;
  readonly sizeFilters = ['Todos', '500x500', '800x800', '700x900'] as const;

  getSizeConfig(size: ImageSizeOption) {
    return IMAGE_SIZE_CONFIG[size] || IMAGE_SIZE_CONFIG['500x500'];
  }

  formatPrice(val: number): string {
    return `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
  }

  async handleDownload(product: Product): Promise<void> {
    await downloadProductImage(product);
  }
}
