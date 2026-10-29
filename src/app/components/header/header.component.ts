import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { STORE_INFO } from '../../../types';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky-top navbar-meudoce py-3">
      <div class="container d-flex flex-wrap align-items-center justify-content-between gap-3">
        <!-- Zone 1: Brand Wordmark + Logo -->
        <a
          routerLink="/"
          class="d-inline-flex align-items-center gap-2 text-decoration-none text-meudoce-dark"
        >
          <img
            [src]="storeInfo.logoUrl"
            alt="Logo Meu Doce"
            class="rounded-circle border border-meudoce object-cover"
            style="width: 38px; height: 38px;"
          />
          <span class="fs-4 font-serif-editorial fw-bold">Meu Doce</span>
        </a>

        <!-- Zone 2: Navigation Links -->
        <nav class="d-flex flex-wrap align-items-center gap-3 gap-md-4">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link-meudoce"
          >
            Início
          </a>
          <a
            routerLink="/cardapio"
            routerLinkActive="active"
            class="nav-link-meudoce fw-semibold"
          >
            Cardápio
          </a>
          <a routerLink="/" fragment="essencia" class="nav-link-meudoce">
            Nossa essência
          </a>
          <a routerLink="/" fragment="avaliacoes" class="nav-link-meudoce">
            Avaliações
          </a>
          <a routerLink="/" fragment="contato" class="nav-link-meudoce">
            Contato
          </a>
        </nav>

        <!-- Zone 3: Cart, Admin Session & Primary WhatsApp Action -->
        <div class="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            (click)="store.isCartOpen.set(true)"
            class="btn btn-sm btn-outline-meudoce rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2"
          >
            
            <span>Carrinho ({{ store.totalCartCount() }})</span>
          </button>

          @if (store.isAuthenticated()) {
            <div class="d-inline-flex align-items-center gap-1">
              <a
                routerLink="/cardapio"
                class="badge rounded-pill bg-dark text-white text-decoration-none px-3 py-2 fw-semibold"
                title="Administrador autenticado"
              >
                🔒 Admin: {{ store.currentAdmin()?.username }}
              </a>
              <button
                type="button"
                (click)="store.logoutAdmin()"
                class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1"
                title="Encerrar sessão administrativa"
              >
                Sair
              </button>
            </div>
          } @else {
            <button
              type="button"
              (click)="store.isLoginModalOpen.set(true)"
              class="btn btn-sm btn-outline-meudoce rounded-pill px-3 py-2"
            >
              🔒 Área Admin
            </button>
          }

          <a
            [href]="whatsappDirectUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm btn-meudoce rounded-pill px-3 py-2 shadow-sm"
          >
            Peça pelo WhatsApp
          </a>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly store = inject(StoreService);
  readonly storeInfo = STORE_INFO;

  readonly whatsappDirectUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    'Olá! Vim pelo site da Meu Doce Doceria Artesanal e gostaria de fazer um pedido.'
  )}`;
}
