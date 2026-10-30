import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StoreService } from '../../services/store.service';
import {
  FlyerMenuItem,
  OFFICIAL_MENU_FLYERS,
  ProductCategory,
  STORE_INFO,
} from '../../../types';
import { FeedbackSectionComponent } from '../../components/feedback-section/feedback-section.component';
import { StoreMapSectionComponent } from '../../components/store-map-section/store-map-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FeedbackSectionComponent,
    StoreMapSectionComponent,
  ],
  template: `
    <!-- =====================================================================
         HERO SECTION (Institutional & Direct Access to Exclusive /cardapio)
       ===================================================================== -->
    <section class="py-5 bg-white overflow-hidden">
      <div class="container py-md-4">
        <div class="row align-items-center g-5">
          <!-- Left Column -->
          <div class="col-12 col-lg-6">
            <p class="tracking-editorial text-meudoce-pink text-uppercase mb-3">
              FEITO COM CARINHO EM CUIABÁ
            </p>

            <h1 class="hero-title fw-bold mb-4">
              Um doce<br />
              momento<br />
              <span class="fst-italic fw-normal text-meudoce-pink">
                muda o seu dia.
              </span>
            </h1>

            <p class="text-meudoce-muted fs-5 mb-4" style="max-width: 500px;">
              Doces artesanais, bolos, salgados e muito amor em cada receita.
              Escolha seus favoritos em nosso cardápio exclusivo e faça seu pedido com a gente.
            </p>

            <!-- Primary Hero Actions -->
            <div class="d-flex flex-wrap align-items-center gap-3 pt-1">
              <a
                routerLink="/cardapio"
                class="btn btn-meudoce rounded-pill px-4 py-3 shadow-sm"
              >
                Conheça o cardápio completo
              </a>

              <a
                [href]="storeInfo.ifoodUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-meudoce rounded-pill px-4 py-3"
              >
                <img [src]="storeInfo.icons.ifood" alt="iFood" class="object-contain me-2" style="width: 20px; height: 20px; vertical-align: text-bottom;" /> Peça pelo iFood
              </a>

              <button
                type="button"
                (click)="store.isCartOpen.set(true)"
                class="btn btn-blush rounded-pill px-3 py-2.5 small"
              >
                Carrinho ({{ store.totalCartCount() }})
              </button>
            </div>
          </div>

          <!-- Right Column: Official Circular Logo & Soft Blush Composition -->
          <div class="col-12 col-lg-6 position-relative d-flex align-items-center justify-content-center">
            <div class="hero-backdrop-circle d-none d-sm-block" aria-hidden="true"></div>

            <div class="hero-logo-frame">
              <div
                class="w-100 h-100 rounded-circle overflow-hidden border border-meudoce"
                style="background-color: #FADADD;"
              >
                <img
                  [src]="storeInfo.logoUrl"
                  alt="Logo Oficial Meu Doce — Doceria Artesanal"
                  class="w-100 h-100 object-cover"
                />
              </div>

              <div class="hero-floating-badge">
                <span class="font-serif-editorial fst-italic small">
                  Um carinho em forma de doce
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         SEÇÃO "NOSSA ESSÊNCIA & ENCARTES OFICIAIS"
         - Encartes em formato de texto manipulável e editável pelo Admin
         - Mesmo padrão visual dos encartes originais, com barra de rolagem interna
       ===================================================================== -->
    <section id="essencia" class="py-5 bg-meudoce-surface border-top border-meudoce">
      <div class="container py-3">
        <div class="row align-items-end justify-content-between mb-4 g-3">
          <div class="col-12 col-lg-8">
            <p class="tracking-editorial text-meudoce-pink text-uppercase mb-2">
              NOSSA ESSÊNCIA & ENCARTES OFICIAIS
            </p>
            <h2 class="display-6 font-serif-editorial fw-bold text-meudoce-dark mb-2">
              Tradição artesanal em cada detalhe
            </h2>
            <p class="text-meudoce-muted mb-0">
              Na <strong>Meu Doce Doceria</strong>, cada receita nasce do cuidado com ingredientes nobres, massas frescas e recheios preparados diariamente. Abaixo você confere nossas três linhas completas.
              <strong>Doces, Salgados e Bebidas</strong>
            </p>
          </div>
          <div class="col-12 col-lg-4 text-lg-end d-flex flex-wrap justify-content-lg-end align-items-center gap-2">
            @if (store.isAuthenticated()) {
              <span class="badge rounded-pill bg-meudoce-blush text-meudoce-pink px-3 py-2">
                🔒 Edição de Encartes Ativa
              </span>
            }
            <a
              routerLink="/cardapio"
              class="btn btn-meudoce rounded-pill px-4 py-2.5 small"
            >
              Abrir página exclusiva do Cardápio →
            </a>
          </div>
        </div>

        <!-- 3-Column Interactive Text Menu Flyers Showcase (Doces, Salgados, Bebidas) -->
        <div class="row g-4">
          @for (flyer of officialFlyers; track flyer.id) {
            <div class="col-12 col-md-4">
              <div class="card-meudoce h-100 d-flex flex-column justify-content-between">
                <div>
                  <!-- Interactive Stylized Text Flyer Board (Replaces Static Image, Same 440px Height + Internal Scroll) -->
                  <div class="flyer-board-container">
                    <div class="flyer-board-top-bar"></div>

                    <div class="flyer-board-header">
                      <p class="flyer-board-brand">Meu Doce Doceria</p>
                      <h3 class="flyer-board-script-title">Cardápio</h3>
                      <p class="flyer-board-category-label">{{ flyer.category }}</p>
                    </div>

                    <!-- Scrollable Menu Lines -->
                    <div
                      class="flyer-board-scroll"
                      role="region"
                      [attr.aria-label]="'Linhas do cardápio de ' + flyer.category"
                      tabindex="0"
                    >
                      @for (line of getFlyerLines(flyer.category); track line.id) {
                        @if (editingLineId() === line.id && store.isAuthenticated()) {
                          <!-- Inline Edit Row for Admin -->
                          <div class="p-2 my-1 rounded-3 bg-meudoce-surface border border-meudoce">
                            <div class="row g-1 align-items-center mb-1">
                              <div class="col-7">
                                <input
                                  type="text"
                                  [ngModel]="editLineName()"
                                  (ngModelChange)="editLineName.set($event)"
                                  placeholder="Nome do item"
                                  class="form-control form-control-sm rounded-2"
                                  style="font-size: 0.78rem;"
                                />
                              </div>
                              <div class="col-5">
                                <input
                                  type="number"
                                  step="0.50"
                                  min="0.50"
                                  [ngModel]="editLinePrice()"
                                  (ngModelChange)="editLinePrice.set($event)"
                                  placeholder="Preço"
                                  class="form-control form-control-sm rounded-2 font-mono-tabular"
                                  style="font-size: 0.78rem;"
                                />
                              </div>
                            </div>
                            <div class="d-flex justify-content-end gap-1">
                              <button
                                type="button"
                                (click)="cancelEditingLine()"
                                class="btn btn-sm btn-outline-meudoce rounded-pill px-2 py-0"
                                style="font-size: 0.72rem;"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                (click)="saveEditedLine(line.id, flyer.category)"
                                [disabled]="isSavingLine()"
                                class="btn btn-sm btn-meudoce rounded-pill px-2 py-0"
                                style="font-size: 0.72rem;"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        } @else {
                          <!-- Standard Menu Line Row -->
                          <div class="flyer-line-row">
                            <span class="flyer-line-name">{{ line.name }}</span>
                            <span class="flyer-line-leader" aria-hidden="true"></span>
                            <span class="flyer-line-price">{{ formatPrice(line.price) }}</span>

                            @if (store.isAuthenticated()) {
                              <span class="d-inline-flex align-items-center gap-1 ms-1 flex-shrink-0">
                                <button
                                  type="button"
                                  (click)="startEditingLine(line)"
                                  class="btn btn-sm btn-outline-meudoce rounded-pill px-1.5 py-0"
                                  style="font-size: 0.68rem; line-height: 1.3;"
                                  title="Editar linha"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  (click)="store.deleteFlyerItem(line.id)"
                                  class="btn btn-sm btn-outline-danger rounded-pill px-1.5 py-0"
                                  style="font-size: 0.68rem; line-height: 1.3;"
                                  title="Remover linha"
                                >
                                  ✕
                                </button>
                              </span>
                            }
                          </div>
                        }
                      } @empty {
                        <p class="text-center small text-meudoce-muted my-4">
                          Nenhum item cadastrado neste encarte.
                        </p>
                      }

                      <!-- Admin Inline New Line Form -->
                      @if (store.isAuthenticated()) {
                        @if (addingCategory() === flyer.category) {
                          <div class="p-2 mt-2 rounded-3 bg-meudoce-surface border border-meudoce">
                            <div class="small fw-bold text-meudoce-pink mb-1" style="font-size: 0.72rem;">
                              NOVA LINHA EM {{ flyer.category | uppercase }}
                            </div>
                            <div class="row g-1 align-items-center mb-1">
                              <div class="col-7">
                                <input
                                  type="text"
                                  [ngModel]="newLineName()"
                                  (ngModelChange)="newLineName.set($event)"
                                  placeholder="Ex.: Tortinha de Limão"
                                  class="form-control form-control-sm rounded-2"
                                  style="font-size: 0.78rem;"
                                />
                              </div>
                              <div class="col-5">
                                <input
                                  type="number"
                                  step="0.50"
                                  min="0.50"
                                  [ngModel]="newLinePrice()"
                                  (ngModelChange)="newLinePrice.set($event)"
                                  placeholder="R$ 12.00"
                                  class="form-control form-control-sm rounded-2 font-mono-tabular"
                                  style="font-size: 0.78rem;"
                                />
                              </div>
                            </div>
                            @if (lineFormError()) {
                              <div class="text-danger mb-1" style="font-size: 0.7rem;">
                                {{ lineFormError() }}
                              </div>
                            }
                            <div class="d-flex justify-content-end gap-1">
                              <button
                                type="button"
                                (click)="cancelAddingLine()"
                                class="btn btn-sm btn-outline-meudoce rounded-pill px-2 py-0"
                                style="font-size: 0.72rem;"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                (click)="submitNewLine(flyer.category)"
                                [disabled]="isSavingLine()"
                                class="btn btn-sm btn-meudoce rounded-pill px-2.5 py-0"
                                style="font-size: 0.72rem;"
                              >
                                Adicionar
                              </button>
                            </div>
                          </div>
                        } @else {
                          <div class="text-center mt-2 pt-1">
                            <button
                              type="button"
                              (click)="openAddLineForm(flyer.category)"
                              class="btn btn-sm btn-blush rounded-pill px-3 py-1"
                              style="font-size: 0.75rem;"
                            >
                              + Adicionar linha em {{ flyer.category }}
                            </button>
                          </div>
                        }
                      }
                    </div>
                  </div>

                  <!-- Expanded Menu Details & Highlights -->
                  <div class="p-4">
                    <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <span class="badge rounded-pill bg-meudoce-blush text-meudoce-pink px-3 py-1">
                        {{ flyer.category }}
                      </span>
                      <span class="small fw-bold text-meudoce-pink font-mono-tabular">
                        {{ flyer.priceRange }}
                      </span>
                    </div>

                    <h3 class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-2">
                      {{ flyer.title }}
                    </h3>
                    <p class="small text-meudoce-muted mb-3">
                      {{ flyer.subtitle }}
                    </p>

                    <ul class="list-unstyled small text-meudoce-dark mb-0 d-flex flex-column gap-1">
                      @for (item of flyer.highlights; track item) {
                        <li class="d-flex align-items-start gap-2">
                          <span class="text-meudoce-pink">•</span>
                          <span>{{ item }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </div>

                <!-- Card Footer Actions (Image buttons removed as requested) -->
                <div
                  class="px-4 py-3 bg-meudoce-surface border-top border-meudoce d-flex align-items-center justify-content-between gap-2"
                >
                  <button
                    type="button"
                    (click)="openCategoryInMenu(flyer.category)"
                    class="btn btn-sm btn-meudoce rounded-pill px-3 py-1.5"
                  >
                    Ver {{ flyer.category }} no catálogo
                  </button>

                  @if (store.isAuthenticated()) {
                    <button
                      type="button"
                      (click)="openAddLineForm(flyer.category)"
                      class="btn btn-sm btn-outline-meudoce rounded-pill px-2.5 py-1"
                    >
                      + Linha
                    </button>
                  } @else {
                    <span class="small text-meudoce-muted font-mono-tabular">
                      {{ getFlyerLines(flyer.category).length }} itens
                    </span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- =====================================================================
         FEEDBACKS SECTION (#avaliacoes - Bounded height + internal scroll)
       ===================================================================== -->
    <app-feedback-section />

    <!-- =====================================================================
         STORE MAP & CONTACTS SECTION (#contato)
       ===================================================================== -->
    <app-store-map-section />
  `,
})
export class HomeComponent {
  readonly store = inject(StoreService);
  private readonly router = inject(Router);
  readonly storeInfo = STORE_INFO;
  readonly officialFlyers = OFFICIAL_MENU_FLYERS;

  // Admin Inline Line Editing & Creation State
  readonly editingLineId = signal<number | null>(null);
  readonly editLineName = signal<string>('');
  readonly editLinePrice = signal<string>('');

  readonly addingCategory = signal<ProductCategory | null>(null);
  readonly newLineName = signal<string>('');
  readonly newLinePrice = signal<string>('');
  readonly lineFormError = signal<string | null>(null);
  readonly isSavingLine = signal<boolean>(false);

  getFlyerLines(category: ProductCategory): FlyerMenuItem[] {
    return this.store.flyerItems().filter((item) => item.category === category);
  }

  formatPrice(val: number): string {
    return `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
  }

  openCategoryInMenu(category: ProductCategory): void {
    this.store.selectedCategory.set(category);
    this.router.navigate(['/cardapio']);
  }

  startEditingLine(line: FlyerMenuItem): void {
    this.addingCategory.set(null);
    this.lineFormError.set(null);
    this.editingLineId.set(line.id);
    this.editLineName.set(line.name);
    this.editLinePrice.set(String(line.price));
  }

  cancelEditingLine(): void {
    this.editingLineId.set(null);
    this.editLineName.set('');
    this.editLinePrice.set('');
  }

  async saveEditedLine(id: number, category: ProductCategory): Promise<void> {
    const cleanName = this.editLineName().trim();
    const parsedPrice = Number(String(this.editLinePrice()).replace(',', '.'));
    if (!cleanName || isNaN(parsedPrice) || parsedPrice <= 0) {
      return;
    }
    this.isSavingLine.set(true);
    try {
      await this.store.updateFlyerItem(id, {
        category,
        name: cleanName,
        price: parsedPrice,
      });
      this.cancelEditingLine();
    } finally {
      this.isSavingLine.set(false);
    }
  }

  openAddLineForm(category: ProductCategory): void {
    this.cancelEditingLine();
    this.lineFormError.set(null);
    this.addingCategory.set(category);
    this.newLineName.set('');
    this.newLinePrice.set('');
  }

  cancelAddingLine(): void {
    this.addingCategory.set(null);
    this.newLineName.set('');
    this.newLinePrice.set('');
    this.lineFormError.set(null);
  }

  async submitNewLine(category: ProductCategory): Promise<void> {
    this.lineFormError.set(null);
    const cleanName = this.newLineName().trim();
    const parsedPrice = Number(String(this.newLinePrice()).replace(',', '.'));
    if (!cleanName) {
      this.lineFormError.set('Informe o nome do item.');
      return;
    }
    if (!this.newLinePrice() || isNaN(parsedPrice) || parsedPrice <= 0) {
      this.lineFormError.set('Informe um preço válido maior que zero.');
      return;
    }

    this.isSavingLine.set(true);
    try {
      await this.store.addFlyerItem({
        category,
        name: cleanName,
        price: parsedPrice,
      });
      this.cancelAddingLine();
    } catch (err: any) {
      this.lineFormError.set(err.message || 'Erro ao adicionar linha.');
    } finally {
      this.isSavingLine.set(false);
    }
  }
}
