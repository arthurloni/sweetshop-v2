import React, { useState } from 'react';
import {
  X,
  Download,
  ShoppingBag,
  ExternalLink,
  Calendar,
  Maximize2,
  Edit3,
  Phone,
  Check,
} from 'lucide-react';
import { IMAGE_SIZE_CONFIG, Product, STORE_INFO } from '../types.ts';
import { downloadProductImage } from '../utils/imageCanvas.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onEditProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) return null;

  const sizeConfig = IMAGE_SIZE_CONFIG[product.imageSize] || IMAGE_SIZE_CONFIG['500x500'];
  const formattedPrice = `R$ ${Number(product.price).toFixed(2).replace('.', ',')}`;

  const whatsappMessage = `Olá! Vi no site da Meu Doce Doceria Artesanal e gostaria de pedir:\n• ${quantity}x *${product.name}* (${formattedPrice} un.)`;
  const whatsappHref =
    product.redirectUrl && product.redirectUrl.trim() !== ''
      ? product.redirectUrl
      : `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadProductImage(product);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#F3DCE2] shadow-2xl max-w-4xl w-full overflow-hidden my-8">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left: Adaptive Product Image */}
          <div className="md:col-span-6 bg-[#FFF9FB] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#F3DCE2]">
            <div
              className={`w-full ${sizeConfig.aspectClass} max-h-[440px] rounded-2xl overflow-hidden border border-[#F3DCE2] bg-white shadow-xs`}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 w-full flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E5D63]">
              <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                <Maximize2 className="w-3.5 h-3.5 text-[#C86D88]" />
                Formato: {sizeConfig.label}
              </span>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#F3DCE2] text-[#23191C] font-semibold hover:border-[#C86D88] hover:text-[#C86D88] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloading ? 'Baixando...' : 'Baixar imagem do doce'}
              </button>
            </div>
          </div>

          {/* Right: Contiguous Purchase & Redirection Module */}
          <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#C86D88] uppercase">
                    {product.category} · {product.imageSize} px
                  </p>
                  <h3 className="text-2xl md:text-3xl font-serif-editorial font-bold text-[#23191C] mt-1">
                    {product.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-[#FFF9FB] border border-[#F3DCE2] flex items-center justify-center text-[#6E5D63] hover:text-[#23191C] transition-colors shrink-0"
                  aria-label="Fechar detalhes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-2xl font-bold text-[#C86D88] font-mono-tabular mt-3">
                {formattedPrice}
              </p>

              <p className="text-sm text-[#6E5D63] leading-relaxed mt-4">
                {product.description ||
                  'Receita artesanal preparada diariamente com ingredientes selecionados na Meu Doce Doceria.'}
              </p>

              <div className="mt-5 pt-4 border-t border-[#F3DCE2] space-y-2 text-xs text-[#6E5D63]">
                {product.manufacturedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C86D88]" />
                    <span>
                      Data de fabricação:{' '}
                      <strong className="text-[#23191C] font-mono-tabular">
                        {product.manufacturedDate}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-[#C86D88]" />
                  <span>
                    Resolução configurada:{' '}
                    <strong className="text-[#23191C] font-mono-tabular">
                      {sizeConfig.width} × {sizeConfig.height} px
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase & Destination Controls */}
            <div className="mt-6 pt-5 border-t border-[#F3DCE2] space-y-3">
              {/* Quantity + Save to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#F3DCE2] rounded-full bg-[#FFF9FB] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full text-sm font-bold text-[#23191C] hover:bg-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold font-mono-tabular">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-full text-sm font-bold text-[#23191C] hover:bg-white transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors whitespace-nowrap"
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      Salvo no carrinho!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Salvar no carrinho
                    </>
                  )}
                </button>
              </div>

              {/* Direct External Redirections (Requirement 4.3: "Ao clicar no produto, o usuário é direcionado para outra localização") */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366]/12 text-[#168A40] border border-[#25D366]/30 text-xs font-semibold hover:bg-[#25D366]/20 transition-colors whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Pedir no WhatsApp
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={STORE_INFO.ifoodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#FCEEF2] text-[#C86D88] border border-[#F3DCE2] text-xs font-semibold hover:bg-[#F9DDE5] transition-colors whitespace-nowrap"
                >
                  Pedir pelo iFood
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditProduct(product);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E5D63] hover:text-[#C86D88] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Corrigir / editar postagem deste produto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
