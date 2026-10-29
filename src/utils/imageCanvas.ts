import { IMAGE_SIZE_CONFIG, ImageSizeOption, Product } from '../types';

/**
 * Generates an artisanal patisserie SVG illustration encoded as a Data URI
 * so every seeded menu item has a crisp, high-resolution visual that also
 * exports cleanly onto an HTML5 Canvas at 500x500, 800x800, or 700x900 px.
 */
export function createPatisserieSvgDataUri(
  title: string,
  category: 'Doces' | 'Salgados' | 'Bebidas',
  themeVariant: 'strawberry' | 'chocolate' | 'caramel' | 'savory' | 'coffee' | 'juice' = 'strawberry'
): string {
  const palettes = {
    strawberry: {
      bg1: '#FFF5F7',
      bg2: '#FCE4EC',
      accent: '#C86D88',
      dark: '#4A2531',
      cream: '#FFFDFD',
      top: '#E11D48',
    },
    chocolate: {
      bg1: '#FDF8F6',
      bg2: '#F5E6E0',
      accent: '#7C3F2C',
      dark: '#2E160F',
      cream: '#FFF8F0',
      top: '#C86D88',
    },
    caramel: {
      bg1: '#FFFBF5',
      bg2: '#FDEFD9',
      accent: '#C67D3B',
      dark: '#3E2411',
      cream: '#FFFDF9',
      top: '#D97706',
    },
    savory: {
      bg1: '#FFFBF2',
      bg2: '#F9EBD2',
      accent: '#D97706',
      dark: '#42280E',
      cream: '#FFF9EB',
      top: '#B45309',
    },
    coffee: {
      bg1: '#FAF6F4',
      bg2: '#EFE4DE',
      accent: '#8B5A42',
      dark: '#2D1B12',
      cream: '#FFFDFB',
      top: '#C86D88',
    },
    juice: {
      bg1: '#FFF5F8',
      bg2: '#FFE4EE',
      accent: '#DB2777',
      dark: '#4A152B',
      cream: '#FFFFFF',
      top: '#F43F5E',
    },
  };

  const p = palettes[themeVariant];
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let illustrationMarkup = '';
  if (category === 'Doces') {
    illustrationMarkup = `
      <!-- Patisserie Pedestal & Cupcake/Dessert -->
      <ellipse cx="400" cy="540" rx="190" ry="32" fill="${p.accent}" opacity="0.14"/>
      <ellipse cx="400" cy="525" rx="165" ry="22" fill="#FFFFFF" stroke="${p.accent}" stroke-width="3" stroke-opacity="0.35"/>
      <!-- Cup/Base -->
      <path d="M295 360 L320 515 C325 530 475 530 480 515 L505 360 Z" fill="${p.accent}" opacity="0.88"/>
      <path d="M312 365 L332 510 M355 365 L365 514 M400 365 L400 515 M445 365 L435 514 M488 365 L468 510" stroke="${p.cream}" stroke-width="3" stroke-linecap="round" opacity="0.45"/>
      <!-- Creamy Swirls -->
      <path d="M275 365 C265 315 325 295 400 305 C475 295 535 315 525 365 C515 390 285 390 275 365 Z" fill="${p.cream}" stroke="${p.dark}" stroke-width="4"/>
      <path d="M295 315 C290 265 350 250 400 260 C450 250 510 265 505 315 C490 340 310 340 295 315 Z" fill="#FDE8EF" stroke="${p.dark}" stroke-width="4"/>
      <path d="M325 268 C330 220 385 205 405 215 C445 210 478 232 472 268 C455 290 345 290 325 268 Z" fill="${p.cream}" stroke="${p.dark}" stroke-width="4"/>
      <!-- Cherry / Strawberry on Top -->
      <circle cx="400" cy="192" r="30" fill="${p.top}" stroke="${p.dark}" stroke-width="4"/>
      <path d="M390 180 C392 172 402 170 406 176" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M405 162 C415 120 445 105 465 98" stroke="${p.dark}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    `;
  } else if (category === 'Salgados') {
    illustrationMarkup = `
      <!-- Golden Baked Empada / Pie -->
      <ellipse cx="400" cy="535" rx="200" ry="34" fill="${p.accent}" opacity="0.16"/>
      <ellipse cx="400" cy="520" rx="175" ry="24" fill="#FFFFFF" stroke="${p.accent}" stroke-width="3" stroke-opacity="0.4"/>
      <path d="M250 370 L285 505 C305 528 495 528 515 505 L550 370 Z" fill="#E6A145" stroke="${p.dark}" stroke-width="4"/>
      <ellipse cx="400" cy="368" rx="155" ry="58" fill="#F5B851" stroke="${p.dark}" stroke-width="4"/>
      <ellipse cx="400" cy="364" rx="125" ry="42" fill="#E09432" opacity="0.55"/>
      <!-- Steam & Herbs -->
      <path d="M350 270 Q340 235 360 205" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.5"/>
      <path d="M400 255 Q390 220 410 190" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.5"/>
      <path d="M450 270 Q440 235 460 205" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.5"/>
    `;
  } else {
    illustrationMarkup = `
      <!-- Artisanal Beverage / Cup -->
      <ellipse cx="400" cy="540" rx="175" ry="30" fill="${p.accent}" opacity="0.16"/>
      <!-- Cup Handle -->
      <path d="M495 335 C555 335 555 445 490 445" stroke="${p.accent}" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M495 335 C555 335 555 445 490 445" stroke="${p.cream}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- Cup Body -->
      <path d="M280 285 L305 505 C315 535 485 535 495 505 L520 285 Z" fill="#FFFFFF" stroke="${p.dark}" stroke-width="4"/>
      <path d="M292 330 L308 495 C318 520 482 520 492 495 L508 330 Z" fill="${p.accent}" opacity="0.85"/>
      <!-- Whipped Cream / Foam Top -->
      <ellipse cx="400" cy="285" rx="120" ry="32" fill="${p.cream}" stroke="${p.dark}" stroke-width="4"/>
      <path d="M435 165 L395 280" stroke="${p.top}" stroke-width="12" stroke-linecap="round"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="${p.bg1}"/>
        <stop offset="100%" stop-color="${p.bg2}"/>
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bgGrad)"/>
    <circle cx="400" cy="365" r="250" fill="#FFFFFF" opacity="0.72"/>
    <circle cx="400" cy="365" r="225" fill="none" stroke="#C86D88" stroke-width="2" stroke-dasharray="6 8" opacity="0.45"/>
    <!-- Decorative Sparkles -->
    <g stroke="#C86D88" stroke-width="2.5" opacity="0.55">
      <line x1="160" y1="180" x2="160" y2="210"/>
      <line x1="145" y1="195" x2="175" y2="195"/>
      <line x1="640" y1="190" x2="640" y2="220"/>
      <line x1="625" y1="205" x2="655" y2="205"/>
    </g>
    ${illustrationMarkup}
    <text x="400" y="645" text-anchor="middle" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="${p.dark}">${safeTitle}</text>
    <text x="400" y="688" text-anchor="middle" font-family="sans-serif" font-size="18" letter-spacing="4" fill="#C86D88">MEU DOCE · DOCERIA ARTESANAL</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Processes an uploaded File or image URL into a standardized JPEG data URL
 * with the exact dimensions selected by the user (500x500, 800x800, or 700x900 px).
 */
export async function processImageToAdaptiveSize(
  imageSource: string,
  sizeOption: ImageSizeOption
): Promise<string> {
  const { width, height } = IMAGE_SIZE_CONFIG[sizeOption] || IMAGE_SIZE_CONFIG['500x500'];

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }

      // Fill background with clean white in case of transparent PNG/SVG
      ctx.fillStyle = '#FFF9FB';
      ctx.fillRect(0, 0, width, height);

      // Smart center-crop (object-fit: cover)
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSource;
  });
}

/**
 * Downloads the product image at its exact configured resolution (500x500, 800x800, or 700x900 px),
 * rendering a subtle patisserie card strip with the product information.
 */
export async function downloadProductImage(product: Product): Promise<void> {
  const sizeConfig = IMAGE_SIZE_CONFIG[product.imageSize] || IMAGE_SIZE_CONFIG['500x500'];
  const { width, height } = sizeConfig;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = product.imageUrl;
  });

  ctx.fillStyle = '#FFF9FB';
  ctx.fillRect(0, 0, width, height);

  if (img.width > 0 && img.height > 0) {
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > targetRatio) {
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    } else {
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Draw subtle bottom information bar so all product fields accompany the downloaded image
  const barHeight = Math.round(height * 0.16);
  const barY = height - barHeight;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.fillRect(0, barY, width, barHeight);

  ctx.fillStyle = '#C86D88';
  ctx.fillRect(0, barY, width, 3);

  const paddingX = Math.round(width * 0.045);
  const titleFontSize = Math.round(width * 0.038);
  const metaFontSize = Math.round(width * 0.024);

  ctx.fillStyle = '#23191C';
  ctx.font = `bold ${titleFontSize}px Georgia, serif`;
  ctx.fillText(product.name, paddingX, barY + Math.round(barHeight * 0.42));

  const priceFormatted = `R$ ${Number(product.price).toFixed(2).replace('.', ',')}`;
  ctx.fillStyle = '#C86D88';
  ctx.font = `bold ${titleFontSize}px monospace`;
  const priceWidth = ctx.measureText(priceFormatted).width;
  ctx.fillText(priceFormatted, width - paddingX - priceWidth, barY + Math.round(barHeight * 0.42));

  ctx.fillStyle = '#6E5D63';
  ctx.font = `${metaFontSize}px sans-serif`;
  const descText =
    product.description?.slice(0, 58) || 'Meu Doce — Doceria Artesanal · Cuiabá - MT';
  ctx.fillText(descText, paddingX, barY + Math.round(barHeight * 0.76));

  if (product.manufacturedDate) {
    const dateText = `Fab: ${product.manufacturedDate} · ${product.imageSize}px`;
    const dateWidth = ctx.measureText(dateText).width;
    ctx.fillText(dateText, width - paddingX - dateWidth, barY + Math.round(barHeight * 0.76));
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const link = document.createElement('a');
  const slug = product.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
  link.download = `meu-doce-${slug}-${product.imageSize}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
