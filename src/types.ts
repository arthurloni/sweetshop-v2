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
  url: string;
}

export interface FlyerMenuItem {
  id: number;
  category: ProductCategory;
  name: string;
  price: number;
  createdAt?: string;
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
    title: 'Doces Artesanais',
    subtitle: 'Receitas clássicas e autorais feitas diariamente com chocolate nobre e frutas frescas.',
    url: '/assets/CARDAPIO01_1efd2637.jpeg',
  },
  {
    id: 'cardapio-salgados',
    category: 'Salgados',
    title: 'Salgados Assados & Tortas',
    subtitle: 'Massas leves e amanteigadas com recheios cremosos e tempero caseiro.',
    url: '/assets/CARDAPIO02_e94365ca.jpeg',
  },
  {
    id: 'cardapio-bebidas',
    category: 'Bebidas',
    title: 'Cafés & Bebidas',
    subtitle: 'Cafés especiais tirados na hora, chocolate quente cremoso, sucos naturais e bebidas geladas.',
    url: '/assets/CARDAPIO03_9fa23d90.jpeg',
  },
];

export const STORE_INFO = {
  name: 'Doce doceria',
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
    github: 'https://github.com/arthurloni',
    linkedin: 'https://www.linkedin.com/in/arthur-loni-7b90a62b8',
  },
};
