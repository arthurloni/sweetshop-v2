export type ImageSizeOption = '500x500' | '800x800' | '700x900';

export type ProductCategory = 'Doces' | 'Salgados' | 'Bebidas';

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  imageSize: ImageSizeOption;
  description: string;
  manufacturedDate: string;
  redirectUrl: string;
  createdAt?: string;
}

export interface Feedback {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  id: number;
  username: string;
  createdAt?: string;
}

export interface OfficialFlyer {
  id: string;
  category: ProductCategory;
  title: string;
  subtitle: string;
  highlights: string[];
  priceRange: string;
  url: string;
}

export const IMAGE_SIZE_CONFIG: Record<
  ImageSizeOption,
  {
    label: string;
    shortLabel: string;
    width: number;
    height: number;
    aspectClass: string;
  }
> = {
  '500x500': {
    label: 'Quadrada (pequena) — 500 x 500 px',
    shortLabel: '500 × 500 px',
    width: 500,
    height: 500,
    aspectClass: 'aspect-square',
  },
  '800x800': {
    label: 'Quadrada (grande) — 800 x 800 px',
    shortLabel: '800 × 800 px',
    width: 800,
    height: 800,
    aspectClass: 'aspect-square',
  },
  '700x900': {
    label: 'Retrato — 700 x 900 px',
    shortLabel: '700 × 900 px',
    width: 700,
    height: 900,
    aspectClass: 'aspect-[7/9]',
  },
};

export const OFFICIAL_MENU_FLYERS: OfficialFlyer[] = [
  {
    id: 'cardapio-doces',
    category: 'Doces',
    title: 'Cardápio Oficial — Doces Artesanais',
    subtitle: 'Receitas clássicas e autorais feitas diariamente com chocolate nobre e frutas frescas.',
    highlights: [
      'Copos e Potinhos da Felicidade (R$ 10 a R$ 15)',
      'Bolos no Pote, Fatias Confeitadas e Mini Pudim (R$ 12 a R$ 20)',
      'Brownies Tradicional, Recheado e na Fatia (R$ 12 a R$ 18)',
      'Coxinhas de Morango, Cones Trufados, Pão de Mel, Bombons e Trufas (R$ 4,50 a R$ 15)',
    ],
    priceRange: 'A partir de R$ 4,50',
    url: '/assets/CARDAPIO01_1efd2637.jpeg',
  },
  {
    id: 'cardapio-salgados',
    category: 'Salgados',
    title: 'Cardápio Oficial — Salgados Assados & Tortas',
    subtitle: 'Massas leves e amanteigadas com recheios cremosos e tempero caseiro.',
    highlights: [
      'Salgados Assados na hora (R$ 10,00)',
      'Empada Artesanal de Carne Seca com Requeijão (R$ 10,00)',
      'Empada Cremosa de Frango (R$ 10,00)',
      'Torta Fria Especial de Frango (R$ 15,00)',
    ],
    priceRange: 'De R$ 10,00 a R$ 15,00',
    url: '/assets/CARDAPIO02_e94365ca.jpeg',
  },
  {
    id: 'cardapio-bebidas',
    category: 'Bebidas',
    title: 'Cardápio Oficial — Cafés & Bebidas',
    subtitle: 'Cafés especiais tirados na hora, chocolate quente cremoso, sucos naturais e bebidas geladas.',
    highlights: [
      'Café Coado, Expresso e Café com Leite (R$ 5,00 a R$ 7,00)',
      'Capuccino Cremoso e Chocolate Quente Europeu (R$ 10,00 a R$ 18,00)',
      'Suco Natural de Morango, Copo 200ml e Jarra 1L (R$ 6,00 a R$ 12,00)',
      'Água Mineral (com/sem gás) e Refrigerantes 220ml, 310ml e 1,5L (R$ 5,00 a R$ 12,00)',
    ],
    priceRange: 'De R$ 5,00 a R$ 18,00',
    url: '/assets/CARDAPIO03_9fa23d90.jpeg',
  },
];

export const STORE_INFO = {
  name: 'Meu Doce',
  subtitle: 'DOCERIA ARTESANAL',
  logoUrl: '/assets/LOGO_465ec8e3.jpeg',
  icons: {
    whatsapp: '/assets/Whatsapp_icon.png',
    instagram: '/assets/Instagram_icon.png',
    ifood: '/assets/Ifood_icon.png',
  },
  address: 'Rua 04 De Janeiro, 780 - Jardim Leblon, Cuiabá - MT, 78008-800',
  whatsappDisplay: '(65) 99342-4125',
  whatsappSecondaryDisplay: '(65) 9342-4125',
  whatsappNumber: '5565993424125',
  mapsShareUrl: 'https://maps.app.goo.gl/Y231nSyVK74WC6yr9',
  instagramUrl: 'https://www.instagram.com/meudoce_doceriaartesanal',
  instagramHandle: '@meudoce_doceriaartesanal',
  ifoodUrl:
    'https://www.ifood.com.br/delivery/cuiaba-mt/meu-doce-doceria-artesanal-jardim-leblon/ee1528fa-0552-4873-b6d6-cfcf712bc35d',
  defaultCoords: {
    lat: -15.6052,
    lng: -56.0688,
  },
  creator: {
    name: 'Arthur Loni',
    role: 'Desenvolvedor de Software',
    github: 'https://github.com/arthurloni',
    linkedin: 'https://www.linkedin.com/in/arthur-loni-7b90a62b8',
  },
};
