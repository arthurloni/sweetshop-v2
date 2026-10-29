import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StoreService } from '../../services/store.service';
import {
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
                🍰 Conheça o cardápio completo
              </a>

              <a
                [href]="storeInfo.ifoodUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-meudoce rounded-pill px-4 py-3"
              >
                Peça pelo iFood <span class="text-meudoce-pink">↗</span>
              </a>

              <button
                type="button"
                (click)="store.isCartOpen.set(true)"
                class="btn btn-blush rounded-pill px-3 py-2.5 small"
              >
                🛍️ Carrinho ({{ store.totalCartCount() }})
              </button>
            </div>

            <!-- Location & Delivery Info Indicator -->
            <div class="pt-4 mt-2 d-flex align-items-center gap-3">
              <div
                class="rounded-circle bg-meudoce-blush text-meudoce-pink d-flex align-items-center justify-content-center flex-shrink-0"
                style="width: 44px; height: 44px;"
              >
                💗
              </div>
              <div>
                <p class="small text-meudoce-muted mb-0">
                  Encomendas e pronta entrega
                </p>
                <p class="small fw-bold text-meudoce-dark mb-0">
                  {{ storeInfo.address }}
                </p>
              </div>
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
         SEÇÃO "NOSSA ESSÊNCIA" (Requirement 4.1:
         - Revised institutional content & expanded official menu boards
         - Removed the Instagram profile image/square block from this section)
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
              Na <strong>Meu Doce — Doceria Artesanal</strong>, cada receita nasce do cuidado com ingredientes nobres, massas frescas e recheios preparados diariamente no Jardim Leblon. Abaixo você confere nossas três linhas completas — <strong>Doces, Salgados e Bebidas</strong> — nos encartes oficiais ampliados ou diretamente no catálogo interativo.
            </p>
          </div>
          <div class="col-12 col-lg-4 text-lg-end">
            <a
              routerLink="/cardapio"
              class="btn btn-meudoce rounded-pill px-4 py-2.5 small"
            >
              Abrir página exclusiva do Cardápio →
            </a>
          </div>
        </div>

        <!-- Expanded 3-Column Official Menu Flyers Showcase (Doces, Salgados, Bebidas) -->
        <div class="row g-4">
          @for (flyer of officialFlyers; track flyer.id) {
            <div class="col-12 col-md-4">
              <div class="card-meudoce h-100 d-flex flex-column justify-content-between">
                <div>
                  <!-- Flyer Artwork Preview -->
                  <div
                    (click)="store.previewFlyerUrl.set(flyer)"
                    class="aspect-flyer bg-meudoce-surface-alt overflow-hidden position-relative border-bottom border-meudoce"
                    style="cursor: pointer; max-height: 440px;"
                  >
                    <img
                      [src]="flyer.url"
                      [alt]="flyer.title"
                      class="w-100 h-100 object-cover"
                    />
                    <div
                      class="position-absolute bottom-0 end-0 m-3 badge rounded-pill bg-white text-meudoce-dark border border-meudoce px-3 py-2 shadow-sm"
                    >
                      🔍 Clique para ampliar
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

                <!-- Card Footer Actions -->
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

                  <div class="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      (click)="store.previewFlyerUrl.set(flyer)"
                      class="btn btn-sm btn-outline-meudoce rounded-pill px-2.5 py-1"
                    >
                      Ampliar
                    </button>
                    <a
                      [href]="flyer.url"
                      download
                      class="btn btn-sm btn-outline-meudoce rounded-pill px-2.5 py-1 text-decoration-none"
                    >
                      ⬇️ Baixar
                    </a>
                  </div>
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

  openCategoryInMenu(category: ProductCategory): void {
    this.store.selectedCategory.set(category);
    this.router.navigate(['/cardapio']);
  }
}
