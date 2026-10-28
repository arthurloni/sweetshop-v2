import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Check, AlertCircle } from 'lucide-react';
import {
  IMAGE_SIZE_CONFIG,
  ImageSizeOption,
  Product,
  ProductCategory,
} from '../types.ts';
import {
  createPatisserieSvgDataUri,
  processImageToAdaptiveSize,
} from '../utils/imageCanvas.ts';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    price: number;
    imageUrl: string;
    category: ProductCategory;
    imageSize: ImageSizeOption;
    description: string;
    manufacturedDate: string;
    redirectUrl: string;
  }) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Doces');
  const [imageSize, setImageSize] = useState<ImageSizeOption>('500x500');
  const [rawImageSource, setRawImageSource] = useState('');
  const [formattedPreviewUrl, setFormattedPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturedDate, setManufacturedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [redirectUrl, setRedirectUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(String(editingProduct.price));
      setCategory(editingProduct.category || 'Doces');
      setImageSize(editingProduct.imageSize || '500x500');
      setRawImageSource(editingProduct.imageUrl);
      setFormattedPreviewUrl(editingProduct.imageUrl);
      setDescription(editingProduct.description || '');
      setManufacturedDate(
        editingProduct.manufacturedDate || new Date().toISOString().slice(0, 10)
      );
      setRedirectUrl(editingProduct.redirectUrl || '');
      setError(null);
    } else {
      setName('');
      setPrice('');
      setCategory('Doces');
      setImageSize('500x500');
      setRawImageSource('');
      setFormattedPreviewUrl('');
      setDescription('');
      setManufacturedDate(new Date().toISOString().slice(0, 10));
      setRedirectUrl('');
      setError(null);
    }
  }, [editingProduct, isOpen]);

  // Re-process image whenever size option or raw image changes
  useEffect(() => {
    let active = true;
    async function updateAdaptivePreview() {
      if (!rawImageSource) {
        setFormattedPreviewUrl('');
        return;
      }
      setIsProcessingImage(true);
      try {
        const processed = await processImageToAdaptiveSize(rawImageSource, imageSize);
        if (active) {
          setFormattedPreviewUrl(processed);
        }
      } catch {
        if (active) {
          setFormattedPreviewUrl(rawImageSource);
        }
      } finally {
        if (active) {
          setIsProcessingImage(false);
        }
      }
    }
    updateAdaptivePreview();
    return () => {
      active = false;
    };
  }, [rawImageSource, imageSize]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageSource(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePatisserieArt = () => {
    const titleForArt = name.trim() || 'Doce Artesanal';
    const theme =
      category === 'Salgados'
        ? 'savory'
        : category === 'Bebidas'
        ? 'coffee'
        : 'strawberry';
    const uri = createPatisserieSvgDataUri(titleForArt, category, theme);
    setRawImageSource(uri);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(String(price).replace(',', '.'));
    if (!name.trim()) {
      setError('O campo Nome é obrigatório.');
      return;
    }
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('O campo Preço é obrigatório e deve ser um valor válido maior que zero.');
      return;
    }
    const finalImage = formattedPreviewUrl || rawImageSource;
    if (!finalImage) {
      setError('A Foto do produto é obrigatória. Anexe uma imagem ou gere uma arte.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        price: parsedPrice,
        imageUrl: finalImage,
        category,
        imageSize,
        description: description.trim(),
        manufacturedDate,
        redirectUrl: redirectUrl.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Não foi possível salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSizeMeta = IMAGE_SIZE_CONFIG[imageSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#F3DCE2] shadow-xl max-w-3xl w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#FFF9FB] border-b border-[#F3DCE2]">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#C86D88]">
              PAINEL CRUD · POSTGRESQL
            </span>
            <h3 className="text-xl font-serif-editorial font-bold text-[#23191C]">
              {editingProduct
                ? `Editar produto: ${editingProduct.name}`
                : 'Cadastrar novo item no cardápio'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#F3DCE2] flex items-center justify-center text-[#6E5D63] hover:text-[#23191C] transition-colors"
            aria-label="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Form Inputs */}
            <div className="md:col-span-7 space-y-4">
              {/* Nome (Obrigatório) */}
              <div>
                <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                  Nome do produto <span className="text-[#C86D88]">* (Obrigatório)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Copo da Felicidade de Morango"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3DCE2] text-sm focus:outline-none focus:border-[#C86D88]"
                  required
                />
              </div>

              {/* Preço (Obrigatório) & Categoria */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                    Preço (R$) <span className="text-[#C86D88]">* (Obrigatório)</span>
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex.: 15.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3DCE2] text-sm font-mono-tabular focus:outline-none focus:border-[#C86D88]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                    Seção do cardápio
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3DCE2] text-sm bg-white focus:outline-none focus:border-[#C86D88]"
                  >
                    <option value="Doces">Doces</option>
                    <option value="Salgados">Salgados</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
              </div>

              {/* Padrão Adaptativo das Imagens (Seção 4.5 da Documentação) */}
              <div>
                <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                  Padrão de tamanho adaptativo da imagem (Seção 4.5)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['500x500', '800x800', '700x900'] as ImageSizeOption[]).map((opt) => {
                    const cfg = IMAGE_SIZE_CONFIG[opt];
                    const selected = imageSize === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setImageSize(opt)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selected
                            ? 'bg-[#FCEEF2] border-[#C86D88] text-[#23191C]'
                            : 'bg-white border-[#F3DCE2] text-[#6E5D63] hover:border-[#C86D88]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono-tabular">
                            {cfg.shortLabel}
                          </span>
                          {selected && <Check className="w-3.5 h-3.5 text-[#C86D88]" />}
                        </div>
                        <span className="text-[11px] block mt-0.5 truncate">
                          {opt === '500x500'
                            ? 'Quadrada (peq.)'
                            : opt === '800x800'
                            ? 'Quadrada (gde.)'
                            : 'Retrato vertical'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descrição & Data de Fabricação */}
              <div>
                <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                  Descrição do produto
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredientes, recheios e detalhes feitos com carinho..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3DCE2] text-sm focus:outline-none focus:border-[#C86D88]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                    Data de fabricação
                  </label>
                  <input
                    type="date"
                    value={manufacturedDate}
                    onChange={(e) => setManufacturedDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F3DCE2] text-sm font-mono-tabular focus:outline-none focus:border-[#C86D88]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                    Link externo (opcional)
                  </label>
                  <input
                    type="url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="Padrão: Pedido no WhatsApp/iFood"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F3DCE2] text-sm focus:outline-none focus:border-[#C86D88]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Photo Attachment & Live Adaptive Preview */}
            <div className="md:col-span-5 flex flex-col justify-between bg-[#FFF9FB] rounded-2xl p-4 border border-[#F3DCE2]">
              <div>
                <label className="block text-xs font-semibold text-[#23191C] mb-2">
                  Foto do produto <span className="text-[#C86D88]">* (Obrigatório)</span>
                </label>

                <div className="flex flex-col gap-2 mb-3">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Anexar foto do dispositivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleGeneratePatisserieArt}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#F3DCE2] text-[#23191C] text-xs font-medium hover:border-[#C86D88] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C86D88]" />
                    Gerar ilustração da confeitaria
                  </button>
                </div>

                {/* Preview Container showing exact adaptive dimensions */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6E5D63] mb-1.5">
                    <span>Pré-visualização adaptativa</span>
                    <span className="font-mono-tabular font-semibold text-[#C86D88]">
                      {activeSizeMeta.width} × {activeSizeMeta.height} px
                    </span>
                  </div>

                  <div
                    className={`w-full ${activeSizeMeta.aspectClass} max-h-60 mx-auto rounded-xl overflow-hidden bg-white border border-[#F3DCE2] flex items-center justify-center relative`}
                  >
                    {formattedPreviewUrl ? (
                      <img
                        src={formattedPreviewUrl}
                        alt={name || 'Prévia do produto'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-xs text-[#6E5D63]">
                        Nenhuma foto selecionada. Anexe uma foto ou clique em gerar ilustração.
                      </div>
                    )}
                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-medium text-[#C86D88]">
                        Formatando {activeSizeMeta.shortLabel}...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F3DCE2] text-[11px] text-[#6E5D63]">
                Todos os campos preenchidos acima serão exibidos junto da imagem no cardápio e no download.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3DCE2]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#F3DCE2] text-xs font-semibold text-[#6E5D63] hover:text-[#23191C] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Salvando no PostgreSQL...'
                : editingProduct
                ? 'Salvar alterações'
                : 'Publicar no cardápio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
