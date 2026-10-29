import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { STORE_INFO } from '../../../types';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (store.isCartOpen()) {
      <div class="cart-drawer-backdrop" (click)="store.isCartOpen.set(false)">
        <div class="cart-drawer-panel shadow-lg" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div
            class="d-flex align-items-center justify-content-between px-4 py-3 bg-meudoce-surface border-bottom border-meudoce"
          >
            <div class="d-flex align-items-center gap-2">
              
              <h3 class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-0">
                Seu carrinho de doces
              </h3>
            </div>
            <button
              type="button"
              (click)="store.isCartOpen.set(false)"
              class="btn btn-sm btn-outline-meudoce rounded-circle"
              style="width: 34px; height: 34px;"
              aria-label="Fechar carrinho"
            >
              ✕
            </button>
          </div>

          <!-- Cart Items -->
          <div class="flex-grow-1 overflow-auto p-4">
            @if (store.cartItems().length === 0) {
              <div class="text-center py-5">
                
                <p class="font-serif-editorial fw-bold fs-5 text-meudoce-dark mb-1">
                  Seu carrinho está vazio
                </p>
                <p class="small text-meudoce-muted mx-auto" style="max-width: 280px;">
                  Adicione seus doces, salgados ou bebidas favoritos do cardápio para montar sua encomenda.
                </p>
              </div>
            } @else {
              <div class="d-flex flex-column gap-3">
                @for (item of store.cartItems(); track item.product.id) {
                  <div
                    class="d-flex align-items-center gap-3 p-3 rounded-4 bg-meudoce-surface border border-meudoce"
                  >
                    <img
                      [src]="item.product.imageUrl"
                      [alt]="item.product.name"
                      class="rounded-3 border border-meudoce bg-white object-cover flex-shrink-0"
                      style="width: 64px; height: 64px;"
                    />
                    <div class="flex-grow-1 min-w-0">
                      <h4 class="small fw-bold text-meudoce-dark text-truncate mb-1">
                        {{ item.product.name }}
                      </h4>
                      <p class="small fw-bold text-meudoce-pink font-mono-tabular mb-2">
                        {{ formatPrice(item.product.price) }}
                      </p>
                      <div class="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          (click)="store.updateCartQty(item.product.id, -1)"
                          class="btn btn-sm btn-outline-meudoce rounded-circle p-0"
                          style="width: 26px; height: 26px;"
                        >
                          -
                        </button>
                        <span class="small fw-bold font-mono-tabular px-1">
                          {{ item.quantity }}
                        </span>
                        <button
                          type="button"
                          (click)="store.updateCartQty(item.product.id, 1)"
                          class="btn btn-sm btn-outline-meudoce rounded-circle p-0"
                          style="width: 26px; height: 26px;"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button type="button" (click)="store.removeFromCart(item.product.id)" class="btn btn-sm btn-outline-danger rounded-circle p-0" style="width: 26px; height: 26px; line-height: 1;" aria-label="Remover item">✕</button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          @if (store.cartItems().length > 0) {
            <div class="p-4 bg-meudoce-surface border-top border-meudoce">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="small text-meudoce-muted">Total estimado</span>
                <span class="fs-5 fw-bold text-meudoce-dark font-mono-tabular">
                  {{ formatPrice(store.totalCartAmount()) }}
                </span>
              </div>

              <div class="d-grid gap-2">
                <a
                  [href]="buildWhatsAppCheckoutUrl()"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-meudoce rounded-pill py-2.5 small"
                >
                  <img [src]="storeInfo.icons.whatsapp" alt="WhatsApp" class="object-contain me-2" style="width: 18px; height: 18px; vertical-align: text-bottom;" /> Enviar pedido completo no WhatsApp
                </a>

                <div class="d-flex align-items-center gap-2">
                  <a
                    [href]="storeInfo.ifoodUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-outline-meudoce rounded-pill py-2 small flex-grow-1"
                  >
                    <img [src]="storeInfo.icons.ifood" alt="iFood" class="object-contain me-2" style="width: 18px; height: 18px; vertical-align: text-bottom;" /> Pedir pelo iFood
                  </a>

                  <button
                    type="button"
                    (click)="store.clearCart()"
                    class="btn btn-link text-danger text-decoration-none small"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class CartDrawerComponent {
  readonly store = inject(StoreService);
  readonly storeInfo = STORE_INFO;

  formatPrice(val: number): string {
    return `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
  }

  buildWhatsAppCheckoutUrl(): string {
    const items = this.store.cartItems();
    const lines = items.map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} — R$ ${(
          Number(item.product.price) * item.quantity
        )
          .toFixed(2)
          .replace('.', ',')}`
    );
    const totalFormatted = this.formatPrice(this.store.totalCartAmount());
    const message = `Olá, Meu Doce Doceria! Gostaria de finalizar meu pedido pelo site:\n\n${lines.join(
      '\n'
    )}\n\n*Total do Pedido: ${totalFormatted}*`;
    return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
