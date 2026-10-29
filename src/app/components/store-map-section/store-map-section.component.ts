import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STORE_INFO } from '../../../types';

@Component({
  selector: 'app-store-map-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="contato" class="py-5 bg-meudoce-surface border-top border-meudoce">
      <div class="container py-3">
        <div class="text-center mx-auto mb-5" style="max-width: 680px;">
          <p class="tracking-editorial text-meudoce-pink text-uppercase mb-2">
            ONDE ESTAMOS & CONTATOS
          </p>
          <h2 class="display-6 font-serif-editorial fw-bold text-meudoce-dark">
            Localização da loja & canais de pedido
          </h2>
          <p class="small text-meudoce-muted mt-2 mb-0">
            Visite nossa loja física no Jardim Leblon em Cuiabá ou faça seu pedido direto pelo WhatsApp, Instagram e iFood.
          </p>
        </div>

        <!-- Map Container -->
        <div class="bg-white rounded-4 border border-meudoce shadow-sm overflow-hidden mb-5">
          <div
            class="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 py-3 bg-meudoce-blush border-bottom border-meudoce"
          >
            <div class="d-flex align-items-center gap-3">
              
              <div>
                <h3 class="small fw-bold text-meudoce-dark mb-0">
                  Meu Doce Doceria — Loja Física
                </h3>
                <p class="small text-meudoce-muted mb-0">{{ storeInfo.address }}</p>
              </div>
            </div>

            <a
              [href]="storeInfo.mapsShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm btn-meudoce rounded-pill px-4 py-2"
            >
              Abrir no Google Maps
            </a>
          </div>

          <!-- Embedded Google Maps iframe for Rua 04 De Janeiro, 780 - Jardim Leblon, Cuiabá - MT, 78008-800 -->
          <div class="w-100 position-relative bg-meudoce-surface" style="height: 380px;">
            <iframe
              title="Localização Meu Doce Doceria Artesanal no Google Maps"
              src="https://maps.google.com/maps?q=Rua%2004%20De%20Janeiro,%20780%20-%20Jardim%20Leblon,%20Cuiab%C3%A1%20-%20MT,%2078008-800&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style="border: 0;"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <!-- Direct Contact Channels (WhatsApp, Instagram, iFood) -->
        <div>
          <p class="text-center tracking-editorial text-meudoce-muted text-uppercase mb-4">
            CANAIS OFICIAIS DE ATENDIMENTO E DELIVERY
          </p>
          <div class="row g-4">
            <!-- WhatsApp -->
            <div class="col-12 col-md-4">
              <a
                [href]="whatsappUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="card-meudoce d-flex align-items-center justify-content-between p-4 text-decoration-none h-100"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 bg-white border border-meudoce p-2 shadow-sm" style="width: 48px; height: 48px;">
                    <img [src]="storeInfo.icons.whatsapp" alt="WhatsApp Meu Doce" class="w-100 h-100 object-contain" />
                  </div>
                  <div>
                    <span class="small text-meudoce-muted d-block">WhatsApp Direto</span>
                    <span class="fw-bold text-meudoce-dark font-mono-tabular d-block">
                      {{ storeInfo.whatsappDisplay }}
                    </span>
                    <span class="small text-meudoce-pink d-block mt-1">
                      Encomendas e pronta entrega
                    </span>
                  </div>
                </div>
                
              </a>
            </div>

            <!-- Instagram (Preserved in Contact section per Requirement 4.1) -->
            <div class="col-12 col-md-4">
              <a
                [href]="storeInfo.instagramUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="card-meudoce d-flex align-items-center justify-content-between p-4 text-decoration-none h-100"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 bg-white border border-meudoce p-2 shadow-sm" style="width: 48px; height: 48px;">
                    <img [src]="storeInfo.icons.instagram" alt="Instagram Meu Doce" class="w-100 h-100 object-contain" />
                  </div>
                  <div>
                    <span class="small text-meudoce-muted d-block">Siga no Instagram</span>
                    <span class="fw-bold text-meudoce-dark d-block text-truncate" style="max-width: 190px;">
                      {{ storeInfo.instagramHandle }}
                    </span>
                    <span class="small text-meudoce-pink d-block mt-1">
                      Novidades e bolos personalizados
                    </span>
                  </div>
                </div>
                
              </a>
            </div>

            <!-- iFood -->
            <div class="col-12 col-md-4">
              <a
                [href]="storeInfo.ifoodUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="card-meudoce d-flex align-items-center justify-content-between p-4 text-decoration-none h-100"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 bg-white border border-meudoce p-2 shadow-sm" style="width: 48px; height: 48px;">
                    <img [src]="storeInfo.icons.ifood" alt="iFood Meu Doce" class="w-100 h-100 object-contain" />
                  </div>
                  <div>
                    <span class="small text-meudoce-muted d-block">Delivery Oficial</span>
                    <span class="fw-bold text-meudoce-dark d-block">
                      Pedir pelo iFood
                    </span>
                    <span class="small text-meudoce-pink d-block mt-1">
                      Entrega rápida em Cuiabá - MT
                    </span>
                  </div>
                </div>
                
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class StoreMapSectionComponent {
  readonly storeInfo = STORE_INFO;
  readonly whatsappUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    'Olá! Vim pelo site da Meu Doce Doceria Artesanal e gostaria de fazer um pedido.'
  )}`;
}
