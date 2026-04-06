<template>
  <div class="container module-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading module...</p>
    </div>

    <template v-else-if="mod">
      <!-- Module header -->
      <div class="module-header">
        <NuxtLink to="/dashboard" class="back-link">← Back to Dashboard</NuxtLink>
        <div class="module-title-row">
          <span class="module-num">Module {{ mod.order }}</span>
          <h1>{{ mod.title }}</h1>
        </div>
        <p class="module-desc">{{ mod.description }}</p>
        <div class="progress-bar" style="margin-top:1rem">
          <div class="progress-bar-fill" :style="{ width: sectionPercent + '%' }"></div>
        </div>
        <span class="section-indicator">Section {{ currentSection + 1 }} of {{ content.sections.length }}{{ showQuiz ? ' — Quiz' : '' }}</span>
      </div>

      <!-- Lesson content -->
      <div v-if="!showQuiz" class="lesson-card card">
        <h2>{{ content.sections[currentSection].title }}</h2>
        <div class="content-body" v-html="renderMarkdown(content.sections[currentSection].body)"></div>

        <div class="lesson-nav">
          <button class="btn btn-secondary" @click="prevSection" :disabled="currentSection === 0">← Previous</button>
          <button v-if="currentSection < content.sections.length - 1" class="btn btn-primary" @click="nextSection">Next →</button>
          <button v-else class="btn btn-gold" @click="startQuiz">Take Quiz 📝</button>
        </div>
      </div>

      <!-- Quiz -->
      <div v-else class="quiz-section">
        <div v-if="!quizFinished" class="card quiz-card">
          <div class="quiz-header">
            <span class="badge badge-yellow">Question {{ currentQuizQ + 1 }} / {{ content.quiz.length }}</span>
          </div>
          <h3 class="quiz-question">{{ content.quiz[currentQuizQ].question }}</h3>
          <div class="quiz-options">
            <button
              v-for="(opt, i) in content.quiz[currentQuizQ].options"
              :key="i"
              class="quiz-option"
              :class="{
                'option-selected': selectedAnswer === i,
                'option-correct': answered && i === content.quiz[currentQuizQ].answer,
                'option-wrong': answered && selectedAnswer === i && i !== content.quiz[currentQuizQ].answer,
              }"
              @click="selectAnswer(i)"
              :disabled="answered"
            >
              <span class="option-letter">{{ ['A', 'B', 'C', 'D'][i] }}</span>
              {{ opt }}
            </button>
          </div>
          <div class="quiz-nav" v-if="answered">
            <p v-if="selectedAnswer === content.quiz[currentQuizQ].answer" class="quiz-feedback correct">✅ Correct!</p>
            <p v-else class="quiz-feedback wrong">❌ The correct answer was: {{ content.quiz[currentQuizQ].options[content.quiz[currentQuizQ].answer] }}</p>
            <button class="btn btn-primary" @click="nextQuizQuestion">
              {{ currentQuizQ < content.quiz.length - 1 ? 'Next Question →' : 'See Results' }}
            </button>
          </div>
        </div>

        <!-- Quiz results -->
        <div v-else class="card quiz-results">
          <div class="results-icon">{{ quizScore >= 75 ? '🎉' : quizScore >= 50 ? '📖' : '💪' }}</div>
          <h2>Quiz Complete!</h2>
          <p class="results-score">Score: <strong>{{ quizScore }}%</strong> ({{ correctCount }}/{{ content.quiz.length }})</p>
          <p class="results-message">
            {{ quizScore >= 75 ? 'Excellent work! You\'ve mastered this module!' : quizScore >= 50 ? 'Good effort! Review the lessons to improve.' : 'Keep studying! Review the material and try again.' }}
          </p>
          <div class="results-actions">
            <button class="btn btn-secondary" @click="retakeQuiz">Retake Quiz</button>
            <button class="btn btn-secondary" @click="reviewLessons">Review Lessons</button>
            <NuxtLink to="/dashboard" class="btn btn-primary">Back to Dashboard →</NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const api = useApi();
const progress = useProgressStore();
const auth = useAuthStore();

const mod = ref<any>(null);
const content = ref<any>({ sections: [], quiz: [] });
const loading = ref(true);

// Lesson state
const currentSection = ref(0);
const showQuiz = ref(false);

// Quiz state
const currentQuizQ = ref(0);
const selectedAnswer = ref<number | null>(null);
const answered = ref(false);
const correctCount = ref(0);
const quizFinished = ref(false);
const quizScore = computed(() => {
  if (content.value.quiz.length === 0) return 0;
  return Math.round((correctCount.value / content.value.quiz.length) * 100);
});

const sectionPercent = computed(() => {
  const total = content.value.sections.length;
  if (showQuiz.value) return 100;
  return Math.round(((currentSection.value + 1) / total) * 100);
});

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- /g, '<br/>• ')
    .replace(/\n(\d+)\. /g, '<br/>$1. ')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function prevSection() { if (currentSection.value > 0) currentSection.value--; }
function nextSection() { if (currentSection.value < content.value.sections.length - 1) currentSection.value++; }

function startQuiz() {
  showQuiz.value = true;
  currentQuizQ.value = 0;
  selectedAnswer.value = null;
  answered.value = false;
  correctCount.value = 0;
  quizFinished.value = false;
}

function selectAnswer(i: number) {
  if (answered.value) return;
  selectedAnswer.value = i;
  answered.value = true;
  if (i === content.value.quiz[currentQuizQ.value].answer) {
    correctCount.value++;
  }
}

async function nextQuizQuestion() {
  if (currentQuizQ.value < content.value.quiz.length - 1) {
    currentQuizQ.value++;
    selectedAnswer.value = null;
    answered.value = false;
  } else {
    quizFinished.value = true;
    // Save progress
    if (auth.isLoggedIn) {
      try {
        await progress.saveProgress(mod.value.id, quizScore.value >= 50, quizScore.value);
      } catch (e) {
        console.error('Failed to save progress:', e);
      }
    }
  }
}

function retakeQuiz() { startQuiz(); }
function reviewLessons() {
  showQuiz.value = false;
  currentSection.value = 0;
}

onMounted(async () => {
  if (!auth.isLoggedIn) { navigateTo('/login'); return; }
  try {
    const id = Number(route.params.id);
    mod.value = await api.get<any>(`/api/modules/${id}`);
    content.value = JSON.parse(mod.value.content);
  } catch (e) {
    console.error('Module load error:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.module-page { max-width: 800px; padding-bottom: 3rem; }

.back-link {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 1rem;
}
.back-link:hover { color: var(--color-primary); }

.module-title-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.module-num {
  padding: 0.25rem 0.75rem;
  background: rgba(34,197,94,0.15);
  color: var(--color-primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.module-header h1 { font-size: 1.5rem; }
.module-desc { color: var(--color-text-muted); margin-top: 0.5rem; }
.section-indicator { font-size: 0.8rem; color: var(--color-text-dim); margin-top: 0.5rem; display: block; }

.module-header { margin-bottom: 2rem; }

.lesson-card { margin-bottom: 2rem; }
.lesson-card:hover { transform: none; }
.lesson-card h2 { font-size: 1.3rem; margin-bottom: 1rem; color: var(--color-gold); }

.lesson-nav {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: space-between;
}

/* Quiz styles */
.quiz-card:hover { transform: none; }
.quiz-header { margin-bottom: 1rem; }
.quiz-question { font-size: 1.15rem; margin-bottom: 1.5rem; }

.quiz-options { display: flex; flex-direction: column; gap: 0.75rem; }
.quiz-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition);
  text-align: left;
}
.quiz-option:hover:not(:disabled) { border-color: var(--color-primary); }
.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.option-selected { border-color: var(--color-accent); }
.option-correct { border-color: var(--color-primary) !important; background: rgba(34,197,94,0.1); }
.option-wrong { border-color: var(--color-danger) !important; background: rgba(239,68,68,0.1); }

.quiz-nav { margin-top: 1.5rem; }
.quiz-feedback { margin-bottom: 1rem; font-weight: 600; }
.quiz-feedback.correct { color: var(--color-primary); }
.quiz-feedback.wrong { color: var(--color-danger); }

.quiz-results { text-align: center; }
.quiz-results:hover { transform: none; }
.results-icon { font-size: 3rem; margin-bottom: 1rem; }
.results-score { font-size: 1.25rem; margin: 1rem 0; }
.results-score strong { color: var(--color-gold); font-size: 1.5rem; }
.results-message { color: var(--color-text-muted); margin-bottom: 1.5rem; }
.results-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

.loading-state { text-align: center; padding: 3rem; color: var(--color-text-muted); }
.loading-state .spinner { margin: 0 auto 1rem; }
</style>
