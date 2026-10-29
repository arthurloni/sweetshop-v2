import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { STORE_INFO } from '../../../types';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-white border-top border-meudoce py-5 mt-auto">
      <div class="container">
        <div
          class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4 pb-4 border-bottom border-meudoce"
        >
          <div class="d-flex align-items-center gap-3">
            <img
              [src]="storeInfo.logoUrl"
              alt="Meu Doce Doceria Artesanal"
              class="rounded-circle border border-meudoce object-cover"
              style="width: 48px; height: 48px;"
            />
            <div>
              <p class="font-serif-editorial fw-bold fs-5 text-meudoce-dark mb-0">
                Meu Doce — Doceria Artesanal
              </p>
              <p class="small text-meudoce-muted mb-0">
                {{ storeInfo.address }} · WhatsApp: {{ storeInfo.whatsappDisplay }}
              </p>
            </div>
          </div>

          <div class="d-flex flex-wrap align-items-center gap-4 small fw-semibold">
            <a routerLink="/" class="nav-link-meudoce">Página Principal</a>
            <a routerLink="/cardapio" class="nav-link-meudoce">Cardápio Exclusivo</a>
            <a routerLink="/" fragment="essencia" class="nav-link-meudoce">Nossa Essência</a>
            <a routerLink="/" fragment="avaliacoes" class="nav-link-meudoce">Avaliações</a>
            <a routerLink="/" fragment="contato" class="nav-link-meudoce">Localização</a>
          </div>
        </div>

        <div
          class="pt-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 small text-meudoce-muted"
        >
          <p class="mb-0">
            © {{ currentYear }} Meu Doce Doceria Artesanal. Todos os direitos reservados.
          </p>

          <div
            class="d-flex flex-wrap align-items-center gap-2 bg-meudoce-surface px-3 py-2 rounded-pill border border-meudoce"
          >
            <span class="text-meudoce-dark fw-medium">
              Desenvolvido por <strong>{{ storeInfo.creator.name }}</strong> ·
              <span class="text-meudoce-muted">{{ storeInfo.creator.role }}</span>
            </span>
            <span class="text-meudoce-muted">|</span>
            <a
              [href]="storeInfo.creator.github"
              target="_blank"
              rel="noopener noreferrer"
              class="fw-semibold text-meudoce-dark text-decoration-none"
            >
              GitHub
            </a>
            <a
              [href]="storeInfo.creator.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="fw-semibold text-meudoce-dark text-decoration-none ms-1"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly storeInfo = STORE_INFO;
  readonly currentYear = new Date().getFullYear();
}
