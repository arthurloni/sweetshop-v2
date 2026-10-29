import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StoreService } from './services/store.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { ModalsComponent } from './components/modals/modals.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CartDrawerComponent,
    ModalsComponent,
  ],
  template: `
    <div class="min-vh-100 d-flex flex-column bg-white text-meudoce-dark">
      @if (store.toastMessage(); as msg) {
        <div class="toast-meudoce d-flex align-items-center gap-2">
          <span>💗</span>
          <span>{{ msg }}</span>
        </div>
      }

      <app-header />

      <main class="flex-grow-1">
        <router-outlet />
      </main>

      <app-footer />

      <app-cart-drawer />
      <app-modals />
    </div>
  `,
})
export class AppComponent {
  readonly store = inject(StoreService);
}
