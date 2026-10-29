import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StoreService } from '../services/store.service';

export const adminGuard: CanActivateFn = async () => {
  const store = inject(StoreService);
  const router = inject(Router);

  const isAuth = await store.verifySessionWithServer();
  if (isAuth) {
    return true;
  }

  store.isLoginModalOpen.set(true);
  store.showToast('Faça login como administrador para acessar a área de gestão.');
  return router.createUrlTree(['/cardapio']);
};
