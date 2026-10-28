import React from 'react';
import { X, Trash2, ShoppingBag, Phone, ExternalLink } from 'lucide-react';
import { CartItem, STORE_INFO } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const formattedTotal = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;

  const buildWhatsAppCheckoutUrl = () => {
    const lines = items.map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} — R$ ${(
          Number(item.product.price) * item.quantity
        )
          .toFixed(2)
          .replace('.', ',')}`
    );
    const message = `Olá, Meu Doce Doceria! Gostaria de finalizar meu pedido pelo site:\n\n${lines.join(
      '\n'
    )}\n\n*Total do Pedido: ${formattedTotal}*`;
    return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-[#F3DCE2] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#FFF9FB] border-b border-[#F3DCE2]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C86D88]" />
            <h3 className="text-lg font-serif-editorial font-bold text-[#23191C]">
              Seu carrinho de doces
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#F3DCE2] flex items-center justify-center text-[#6E5D63] hover:text-[#23191C]"
            aria-label="Fechar carrinho"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-[#FCEEF2] text-[#C86D88] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-base font-serif-editorial font-semibold text-[#23191C]">
                Seu carrinho está vazio
              </p>
              <p className="text-xs text-[#6E5D63] mt-1 max-w-xs mx-auto">
                Adicione seus doces, salgados ou bebidas favoritos do cardápio para montar sua encomenda.
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FFF9FB] border border-[#F3DCE2]"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-[#F3DCE2] bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#23191C] truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs font-bold text-[#C86D88] font-mono-tabular mt-0.5">
                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="w-6 h-6 rounded-full bg-white border border-[#F3DCE2] text-xs font-bold text-[#23191C] hover:border-[#C86D88]"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold font-mono-tabular w-5 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="w-6 h-6 rounded-full bg-white border border-[#F3DCE2] text-xs font-bold text-[#23191C] hover:border-[#C86D88]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(product.id)}
                  className="p-2 text-[#6E5D63] hover:text-red-600 transition-colors"
                  aria-label="Remover item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-[#FFF9FB] border-t border-[#F3DCE2] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6E5D63]">Total estimado</span>
              <span className="text-xl font-bold text-[#23191C] font-mono-tabular">
                {formattedTotal}
              </span>
            </div>

            <div className="space-y-2.5">
              <a
                href={buildWhatsAppCheckoutUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Enviar pedido completo no WhatsApp
              </a>

              <div className="flex items-center justify-between gap-2">
                <a
                  href={STORE_INFO.ifoodUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#F3DCE2] text-xs font-semibold text-[#23191C] hover:border-[#C86D88] transition-colors"
                >
                  Pedir pelo iFood
                  <ExternalLink className="w-3 h-3 text-[#C86D88]" />
                </a>

                <button
                  type="button"
                  onClick={onClearCart}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#6E5D63] hover:text-red-600 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
