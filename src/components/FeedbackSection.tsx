import React, { useState } from 'react';
import { Star, Edit3, Trash2, Check, X, MessageSquareHeart } from 'lucide-react';
import { Feedback } from '../types.ts';

interface FeedbackSectionProps {
  feedbacks: Feedback[];
  isAdminMode: boolean;
  onAddFeedback: (input: {
    authorName: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
  onUpdateFeedback: (
    id: number,
    input: { authorName: string; rating: number; comment: string }
  ) => Promise<void>;
  onDeleteFeedback: (id: number) => Promise<void>;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbacks,
  isAdminMode,
  onAddFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, item) => acc + Number(item.rating), 0) /
          feedbacks.length
        ).toFixed(1)
      : '5.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddFeedback({
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
      });
      setAuthorName('');
      setRating(5);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (fb: Feedback) => {
    setEditingId(fb.id);
    setEditAuthor(fb.authorName);
    setEditRating(fb.rating);
    setEditComment(fb.comment);
  };

  const saveEdit = async (id: number) => {
    if (!editAuthor.trim() || !editComment.trim()) return;
    await onUpdateFeedback(id, {
      authorName: editAuthor.trim(),
      rating: editRating,
      comment: editComment.trim(),
    });
    setEditingId(null);
  };

  return (
    <section id="avaliacoes" className="py-20 bg-white border-t border-[#F3DCE2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#C86D88] mb-2">
              CARINHO DE QUEM JÁ PROVOU
            </p>
            <h2 className="text-3xl md:text-4xl font-serif-editorial text-[#23191C]">
              Mural exclusivo de feedbacks
            </h2>
            <p className="mt-2 text-sm text-[#6E5D63] max-w-xl">
              Deixe seu comentário e sua nota em estrelas. Sua opinião ajuda nossa doceria a criar momentos cada vez mais especiais.
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-[#FFF9FB] border border-[#F3DCE2]">
            <div className="text-3xl font-bold text-[#23191C] font-mono-tabular">
              {averageRating}
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#F59E0B]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[#6E5D63] font-mono-tabular">
                {feedbacks.length} avaliações verificadas
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Form to write a new feedback */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 bg-[#FFF9FB] rounded-3xl p-6 md:p-7 border border-[#F3DCE2] space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquareHeart className="w-5 h-5 text-[#C86D88]" />
              <h3 className="text-lg font-serif-editorial font-bold text-[#23191C]">
                Escrever avaliação
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                Sua nota em estrelas
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className="p-1.5 rounded-lg hover:bg-[#FCEEF2] transition-colors"
                    aria-label={`${starValue} estrelas`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        starValue <= rating
                          ? 'text-[#F59E0B] fill-current'
                          : 'text-[#D6C5CA]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-[#6E5D63] ml-1 font-mono-tabular">
                  {rating}/5 estrelas
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                Seu nome
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex.: Ana Clara"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F3DCE2] text-sm focus:outline-none focus:border-[#C86D88]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#23191C] mb-1.5">
                Seu comentário sobre os doces
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte qual foi seu doce favorito e como foi sua experiência..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F3DCE2] text-sm focus:outline-none focus:border-[#C86D88]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#C86D88] text-white text-xs font-semibold hover:bg-[#B55975] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar comentário'}
            </button>
          </form>

          {/* Right: List of Feedbacks with Admin Edit / Delete controls */}
          <div className="lg:col-span-7 space-y-4">
            {feedbacks.map((fb) => {
              const isEditingThis = editingId === fb.id;
              return (
                <div
                  key={fb.id}
                  className="p-6 rounded-2xl bg-[#FFF9FB] border border-[#F3DCE2] transition-all"
                >
                  {isEditingThis ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C86D88]">
                          MODERAÇÃO DA ADMINISTRADORA · EDITAR COMENTÁRIO
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setEditRating(s)}
                              className="p-1"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  s <= editRating
                                    ? 'text-[#F59E0B] fill-current'
                                    : 'text-[#D6C5CA]'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#F3DCE2] text-sm font-semibold"
                      />

                      <textarea
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#F3DCE2] text-sm"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#F3DCE2] text-xs font-medium text-[#6E5D63]"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(fb.id)}
                          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#C86D88] text-white text-xs font-semibold"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Salvar edição
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#23191C]">
                              {fb.authorName}
                            </h4>
                            <span className="text-[#D6C5CA]" aria-hidden="true">
                              ·
                            </span>
                            <div className="flex items-center gap-0.5 text-[#F59E0B]">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3.5 h-3.5 ${
                                    idx < fb.rating ? 'fill-current' : 'text-[#E5D5DA]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Administrator Controls (Always accessible when Admin Mode is on, or via subtle action buttons) */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(fb)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isAdminMode
                                ? 'bg-white border border-[#F3DCE2] text-[#23191C] hover:border-[#C86D88]'
                                : 'text-[#6E5D63] hover:text-[#C86D88]'
                            }`}
                            title="Editar comentário (Administradora)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteFeedback(fb.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isAdminMode
                                ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                                : 'text-[#6E5D63] hover:text-red-600'
                            }`}
                            title="Apagar comentário (Administradora)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Apagar</span>
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-[#4A3B40] leading-relaxed">
                        “{fb.comment}”
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
