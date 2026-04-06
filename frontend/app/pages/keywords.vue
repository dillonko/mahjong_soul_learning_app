<template>
  <div class="container keywords-page">
    <div class="page-header">
      <h1>🃏 Keyword Flashcards</h1>
      <p>Master essential Mahjong terminology. Click a card to flip it!</p>
    </div>

    <!-- Mode selector -->
    <div class="mode-toggle">
      <button class="btn" :class="mode === 'browse' ? 'btn-primary' : 'btn-ghost'" @click="mode = 'browse'">Browse All</button>
      <button class="btn" :class="mode === 'flashcard' ? 'btn-primary' : 'btn-ghost'" @click="startFlashcards">Flashcard Mode</button>
    </div>

    <!-- Category filter -->
    <div class="category-filter" v-if="mode === 'browse'">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="btn btn-sm"
        :class="selectedCategory === cat.value ? 'btn-primary' : 'btn-ghost'"
        @click="selectedCategory = cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Browse mode -->
    <div v-if="mode === 'browse'" class="keywords-grid">
      <div
        v-for="kw in filteredKeywords"
        :key="kw.id"
        class="card keyword-card"
        :class="{ flipped: flippedIds.has(kw.id) }"
        @click="toggleFlip(kw.id)"
      >
        <div class="card-inner">
          <div class="card-front">
            <span class="kw-category badge" :class="categoryBadge(kw.category)">{{ kw.category }}</span>
            <h3>{{ kw.term }}</h3>
            <p class="flip-hint">Click to reveal</p>
          </div>
          <div class="card-back">
            <p class="kw-definition">{{ kw.definition }}</p>
            <p v-if="kw.examples" class="kw-examples"><strong>Example:</strong> {{ kw.examples }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Flashcard mode -->
    <div v-if="mode === 'flashcard'" class="flashcard-mode">
      <div v-if="flashcards.length > 0" class="flashcard-container">
        <div class="flashcard-progress">
          Card {{ flashcardIdx + 1 }} of {{ flashcards.length }}
          <div class="progress-bar" style="margin-top:0.5rem">
            <div class="progress-bar-fill" :style="{ width: ((flashcardIdx + 1) / flashcards.length * 100) + '%' }"></div>
          </div>
        </div>

        <div
          class="card flashcard"
          :class="{ flipped: flashcardFlipped }"
          @click="flashcardFlipped = !flashcardFlipped"
        >
          <div class="card-inner">
            <div class="card-front">
              <span class="kw-category badge" :class="categoryBadge(flashcards[flashcardIdx].category)">{{ flashcards[flashcardIdx].category }}</span>
              <h2>{{ flashcards[flashcardIdx].term }}</h2>
              <p class="flip-hint">Click to flip</p>
            </div>
            <div class="card-back">
              <p class="kw-definition">{{ flashcards[flashcardIdx].definition }}</p>
              <p v-if="flashcards[flashcardIdx].examples" class="kw-examples"><strong>Example:</strong> {{ flashcards[flashcardIdx].examples }}</p>
            </div>
          </div>
        </div>

        <div class="flashcard-nav">
          <button class="btn btn-secondary" @click="prevFlashcard" :disabled="flashcardIdx === 0">← Prev</button>
          <button class="btn btn-gold" @click="shuffleFlashcards">🔀 Shuffle</button>
          <button class="btn btn-secondary" @click="nextFlashcard" :disabled="flashcardIdx === flashcards.length - 1">Next →</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const auth = useAuthStore();

const keywords = ref<any[]>([]);
const loading = ref(true);
const mode = ref<'browse' | 'flashcard'>('browse');
const selectedCategory = ref('all');
const flippedIds = ref(new Set<number>());

// Flashcard state
const flashcards = ref<any[]>([]);
const flashcardIdx = ref(0);
const flashcardFlipped = ref(false);

const categories = [
  { value: 'all', label: 'All' },
  { value: 'tiles', label: '🀄 Tiles' },
  { value: 'yaku', label: '🏆 Yaku' },
  { value: 'gameplay', label: '🎮 Gameplay' },
  { value: 'scoring', label: '💰 Scoring' },
  { value: 'strategy', label: '🧠 Strategy' },
];

const filteredKeywords = computed(() => {
  if (selectedCategory.value === 'all') return keywords.value;
  return keywords.value.filter((kw) => kw.category === selectedCategory.value);
});

function categoryBadge(cat: string): string {
  const map: Record<string, string> = { tiles: 'badge-blue', yaku: 'badge-yellow', gameplay: 'badge-green', scoring: 'badge-yellow', strategy: 'badge-red' };
  return map[cat] || 'badge-green';
}

function toggleFlip(id: number) {
  const s = new Set(flippedIds.value);
  if (s.has(id)) s.delete(id); else s.add(id);
  flippedIds.value = s;
}

function startFlashcards() {
  mode.value = 'flashcard';
  flashcards.value = [...keywords.value].sort(() => Math.random() - 0.5);
  flashcardIdx.value = 0;
  flashcardFlipped.value = false;
}

function prevFlashcard() {
  if (flashcardIdx.value > 0) { flashcardIdx.value--; flashcardFlipped.value = false; }
}
function nextFlashcard() {
  if (flashcardIdx.value < flashcards.value.length - 1) { flashcardIdx.value++; flashcardFlipped.value = false; }
}
function shuffleFlashcards() {
  flashcards.value = [...flashcards.value].sort(() => Math.random() - 0.5);
  flashcardIdx.value = 0;
  flashcardFlipped.value = false;
}

onMounted(async () => {
  if (!auth.isLoggedIn) { navigateTo('/login'); return; }
  try {
    keywords.value = await api.get<any[]>('/api/keywords');
  } catch (e) {
    console.error('Keywords load error:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.keywords-page { padding-bottom: 3rem; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.75rem; }
.page-header p { color: var(--color-text-muted); margin-top: 0.25rem; }

.mode-toggle { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.category-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }

.keywords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.keyword-card {
  cursor: pointer;
  perspective: 1000px;
  min-height: 160px;
  padding: 0;
  overflow: hidden;
}
.keyword-card:hover { transform: none; }

.card-inner {
  position: relative;
  width: 100%;
  min-height: 160px;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.flipped .card-inner { transform: rotateY(180deg); }

.card-front, .card-back {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  backface-visibility: hidden;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-front { text-align: center; }
.card-back {
  transform: rotateY(180deg);
  background: var(--color-bg-elevated);
  border-radius: var(--radius);
}

.kw-category { align-self: center; margin-bottom: 0.75rem; }
.keyword-card h3 { font-size: 1.15rem; }
.flip-hint { color: var(--color-text-dim); font-size: 0.75rem; margin-top: 0.5rem; }

.kw-definition { font-size: 0.9rem; line-height: 1.5; }
.kw-examples { margin-top: 0.75rem; font-size: 0.8rem; color: var(--color-text-muted); }

/* Flashcard mode */
.flashcard-mode { max-width: 600px; margin: 0 auto; }
.flashcard-progress { text-align: center; color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }

.flashcard {
  cursor: pointer;
  perspective: 1000px;
  min-height: 250px;
  padding: 0;
  margin-bottom: 1.5rem;
}
.flashcard:hover { transform: none; }
.flashcard .card-inner { min-height: 250px; }
.flashcard .card-front h2 { font-size: 1.5rem; }
.flashcard .kw-definition { font-size: 1rem; }

.flashcard-nav { display: flex; gap: 1rem; justify-content: center; }

.loading-state { text-align: center; padding: 3rem; }
.loading-state .spinner { margin: 0 auto; }
</style>
