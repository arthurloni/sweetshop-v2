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

export const STORE_INFO = {
  name: 'Meu Doce',
  subtitle: 'DOCERIA ARTESANAL',
  address: 'Rua 4 de Janeiro, 780 — Jardim Leblon, Cuiabá - MT',
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
