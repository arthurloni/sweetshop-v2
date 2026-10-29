import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { Feedback } from '../../../types';

@Component({
  selector: 'app-feedback-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="avaliacoes" class="py-5 bg-white border-top border-meudoce">
      <div class="container py-3">
        <!-- Section Header -->
        <div
          class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4 gap-3"
        >
          <div>
            <p class="tracking-editorial text-meudoce-pink text-uppercase mb-1">
              CARINHO DE QUEM JÁ PROVOU
            </p>
            <h2 class="display-6 font-serif-editorial fw-bold text-meudoce-dark mb-2">
              Mural exclusivo de avaliações
            </h2>
            <p class="small text-meudoce-muted mb-0" style="max-width: 560px;">
              Deixe seu comentário e sua nota de 1 a 5 estrelas. Sua opinião ajuda nossa doceria a criar momentos cada vez mais especiais.
            </p>
          </div>

          <div
            class="d-flex align-items-center gap-3 px-4 py-3 rounded-4 bg-meudoce-surface border border-meudoce align-self-start align-self-md-end"
          >
            <div class="fs-2 fw-bold text-meudoce-dark font-mono-tabular">
              {{ averageRating() }}
            </div>
            <div>
              <div class="text-warning small">★★★★★</div>
              <span class="small text-meudoce-muted font-mono-tabular">
                {{ store.feedbacks().length }} avaliações publicadas
              </span>
            </div>
          </div>
        </div>

        <div class="row g-4 align-items-start">
          <!-- Left Column: Public Form to submit a new feedback (1 to 5 stars + comment) -->
          <div class="col-12 col-lg-5">
            <form
              (ngSubmit)="handleSubmit()"
              class="bg-meudoce-surface rounded-4 p-4 border border-meudoce"
            >
              <div class="d-flex align-items-center gap-2 mb-3">
                <span class="fs-5">💬</span>
                <h3 class="h5 font-serif-editorial fw-bold text-meudoce-dark mb-0">
                  Escrever avaliação
                </h3>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-meudoce-dark">
                  Sua nota em estrelas (1 a 5)
                </label>
                <div class="d-flex align-items-center gap-1">
                  @for (starVal of [1, 2, 3, 4, 5]; track starVal) {
                    <button
                      type="button"
                      (click)="rating.set(starVal)"
                      class="btn btn-sm border-0 fs-4 p-1"
                      [class.text-warning]="starVal <= rating()"
                      [class.text-secondary]="starVal > rating()"
                      [attr.aria-label]="starVal + ' estrelas'"
                    >
                      ★
                    </button>
                  }
                  <span class="small fw-semibold text-meudoce-muted ms-2 font-mono-tabular">
                    {{ rating() }}/5 estrelas
                  </span>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-meudoce-dark">
                  Seu nome
                </label>
                <input
                  type="text"
                  name="authorName"
                  [ngModel]="authorName()"
                  (ngModelChange)="authorName.set($event)"
                  placeholder="Ex.: Ana Clara"
                  required
                  class="form-control rounded-3 small"
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-meudoce-dark">
                  Seu comentário sobre os doces
                </label>
                <textarea
                  rows="3"
                  name="comment"
                  [ngModel]="comment()"
                  (ngModelChange)="comment.set($event)"
                  placeholder="Conte qual foi seu doce favorito e como foi sua experiência..."
                  required
                  class="form-control rounded-3 small"
                ></textarea>
              </div>

              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="btn btn-meudoce w-100 rounded-pill py-2.5 small"
              >
                {{ isSubmitting() ? 'Publicando...' : 'Publicar comentário' }}
              </button>
            </form>
          </div>

          <!-- Right Column: Scrollable Feedback List (Requirement 4.4: Bounded height + internal scroll) -->
          <div class="col-12 col-lg-7">
            <div class="d-flex align-items-center justify-content-between mb-2 px-1">
              <span class="small fw-semibold text-meudoce-muted">
                Comentários dos clientes (role internamente para ver mais)
              </span>
              @if (store.isAuthenticated()) {
                <span class="badge rounded-pill bg-meudoce-blush text-meudoce-pink">
                  Moderação Admin Habilitada
                </span>
              }
            </div>

            <div
              class="feedback-scroll-container d-flex flex-column gap-3"
              role="region"
              aria-label="Lista de avaliações de clientes com rolagem interna"
              tabindex="0"
            >
              @for (fb of store.feedbacks(); track fb.id) {
                <div class="p-4 rounded-4 bg-meudoce-surface border border-meudoce">
                  @if (editingId() === fb.id && store.isAuthenticated()) {
                    <div class="d-flex flex-column gap-2">
                      <div class="d-flex align-items-center justify-content-between">
                        <span class="small fw-bold text-meudoce-pink">
                          MODERAÇÃO ADMINISTRATIVA · EDITAR COMENTÁRIO
                        </span>
                        <div class="d-flex align-items-center gap-1">
                          @for (s of [1, 2, 3, 4, 5]; track s) {
                            <button
                              type="button"
                              (click)="editRating.set(s)"
                              class="btn btn-sm p-0 border-0 fs-5"
                              [class.text-warning]="s <= editRating()"
                              [class.text-secondary]="s > editRating()"
                            >
                              ★
                            </button>
                          }
                        </div>
                      </div>

                      <input
                        type="text"
                        [ngModel]="editAuthor()"
                        (ngModelChange)="editAuthor.set($event)"
                        name="editAuthor"
                        class="form-control form-control-sm rounded-3 fw-semibold"
                      />

                      <textarea
                        rows="3"
                        [ngModel]="editComment()"
                        (ngModelChange)="editComment.set($event)"
                        name="editComment"
                        class="form-control form-control-sm rounded-3"
                      ></textarea>

                      <div class="d-flex justify-content-end gap-2 mt-1">
                        <button
                          type="button"
                          (click)="editingId.set(null)"
                          class="btn btn-sm btn-outline-meudoce rounded-pill px-3"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          (click)="saveEdit(fb.id)"
                          class="btn btn-sm btn-meudoce rounded-pill px-3"
                        >
                          Salvar edição
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="d-flex align-items-start justify-content-between gap-3">
                      <div>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                          <h4 class="small fw-bold text-meudoce-dark mb-0">
                            {{ fb.authorName }}
                          </h4>
                          <span class="text-meudoce-muted">·</span>
                          <span class="text-warning small" aria-label="Nota">
                            {{ '★'.repeat(fb.rating) }}{{ '☆'.repeat(5 - fb.rating) }}
                          </span>
                        </div>
                      </div>

                      <!-- Edit and Delete restricted strictly to authenticated administrators (Requirement 4.3 & 4.4) -->
                      @if (store.isAuthenticated()) {
                        <div class="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            (click)="startEditing(fb)"
                            class="btn btn-sm btn-outline-meudoce rounded-pill px-2.5 py-1"
                            title="Editar comentário (Administrador)"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            (click)="store.deleteFeedback(fb.id)"
                            class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1"
                            title="Apagar comentário (Administrador)"
                          >
                            🗑️ Apagar
                          </button>
                        </div>
                      }
                    </div>

                    <p class="mt-2 mb-0 small text-meudoce-dark">
                      “{{ fb.comment }}”
                    </p>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FeedbackSectionComponent {
  readonly store = inject(StoreService);

  readonly authorName = signal('');
  readonly rating = signal(5);
  readonly comment = signal('');
  readonly isSubmitting = signal(false);

  readonly editingId = signal<number | null>(null);
  readonly editAuthor = signal('');
  readonly editRating = signal(5);
  readonly editComment = signal('');

  readonly averageRating = computed(() => {
    const list = this.store.feedbacks();
    if (list.length === 0) return '5.0';
    const avg =
      list.reduce((acc, item) => acc + Number(item.rating), 0) / list.length;
    return avg.toFixed(1);
  });

  async handleSubmit(): Promise<void> {
    if (!this.authorName().trim() || !this.comment().trim()) return;
    this.isSubmitting.set(true);
    try {
      await this.store.addFeedback({
        authorName: this.authorName().trim(),
        rating: this.rating(),
        comment: this.comment().trim(),
      });
      this.authorName.set('');
      this.rating.set(5);
      this.comment.set('');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startEditing(fb: Feedback): void {
    this.editingId.set(fb.id);
    this.editAuthor.set(fb.authorName);
    this.editRating.set(fb.rating);
    this.editComment.set(fb.comment);
  }

  async saveEdit(id: number): Promise<void> {
    if (!this.editAuthor().trim() || !this.editComment().trim()) return;
    await this.store.updateFeedback(id, {
      authorName: this.editAuthor().trim(),
      rating: this.editRating(),
      comment: this.editComment().trim(),
    });
    this.editingId.set(null);
  }
}
