import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Meu Doce — Doceria Artesanal | Cuiabá - MT',
  },
  {
    path: 'cardapio',
    component: MenuComponent,
    title: 'Cardápio Completo | Meu Doce — Doceria Artesanal',
  },
  {
    path: 'admin',
    component: MenuComponent,
    canActivate: [adminGuard],
    title: 'Gerenciar Cardápio (Admin) | Meu Doce',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
