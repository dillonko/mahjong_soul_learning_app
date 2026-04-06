<template>
  <div class="container strategies-page">
    <div class="page-header">
      <h1>🏆 Strategy Guides</h1>
      <p>Proven strategies for winning more games in Mahjong Soul.</p>
    </div>

    <!-- Difficulty filter -->
    <div class="diff-filter">
      <button
        v-for="d in difficulties"
        :key="d.value"
        class="btn btn-sm"
        :class="selectedDiff === d.value ? 'btn-primary' : 'btn-ghost'"
        @click="selectedDiff = d.value"
      >
        {{ d.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

    <!-- Strategy list -->
    <div v-else class="strategy-list">
      <div
        v-for="strat in filteredStrategies"
        :key="strat.id"
        class="card strategy-card"
        :class="{ expanded: expandedId === strat.id }"
        @click="toggle(strat.id)"
      >
        <div class="strat-header">
          <div>
            <span class="badge" :class="diffBadge(strat.difficulty)">{{ strat.difficulty }}</span>
            <h3>{{ strat.title }}</h3>
            <p class="strat-desc">{{ strat.description }}</p>
          </div>
          <span class="expand-icon">{{ expandedId === strat.id ? '▲' : '▼' }}</span>
        </div>

        <div v-if="expandedId === strat.id" class="strat-content" @click.stop>
          <div class="strat-body">
            <div class="strat-overview">
              <h4>Overview</h4>
              <p>{{ parseContent(strat.content).overview }}</p>
            </div>

            <div class="strat-steps">
              <h4>Steps</h4>
              <ol>
                <li v-for="(step, i) in parseContent(strat.content).steps" :key="i">{{ step }}</li>
              </ol>
            </div>

            <div class="strat-tips" v-if="parseContent(strat.content).tips?.length">
              <h4>💡 Tips</h4>
              <ul>
                <li v-for="(tip, i) in parseContent(strat.content).tips" :key="i">{{ tip }}</li>
              </ul>
            </div>

            <div class="strat-when" v-if="parseContent(strat.content).when_to_use">
              <h4>When to Use</h4>
              <p>{{ parseContent(strat.content).when_to_use }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const auth = useAuthStore();

const strategies = ref<any[]>([]);
const loading = ref(true);
const selectedDiff = ref('all');
const expandedId = ref<number | null>(null);

const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: '🌱 Beginner' },
  { value: 'intermediate', label: '⚡ Intermediate' },
  { value: 'advanced', label: '🔥 Advanced' },
];

const filteredStrategies = computed(() => {
  if (selectedDiff.value === 'all') return strategies.value;
  return strategies.value.filter((s) => s.difficulty === selectedDiff.value);
});

function diffBadge(d: string): string {
  const map: Record<string, string> = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' };
  return map[d] || 'badge-green';
}

function toggle(id: number) {
  expandedId.value = expandedId.value === id ? null : id;
}

function parseContent(raw: string): any {
  try { return JSON.parse(raw); } catch { return { overview: raw, steps: [], tips: [] }; }
}

onMounted(async () => {
  if (!auth.isLoggedIn) { navigateTo('/login'); return; }
  try {
    strategies.value = await api.get<any[]>('/api/strategies');
  } catch (e) {
    console.error('Strategies load error:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.strategies-page { padding-bottom: 3rem; max-width: 900px; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.75rem; }
.page-header p { color: var(--color-text-muted); margin-top: 0.25rem; }

.diff-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }

.strategy-list { display: flex; flex-direction: column; gap: 1rem; }

.strategy-card { cursor: pointer; transition: all var(--transition); }
.strategy-card:hover { transform: none; border-color: var(--color-primary); }
.strategy-card.expanded { border-color: var(--color-primary); }

.strat-header { display: flex; justify-content: space-between; align-items: flex-start; }
.strat-header h3 { font-size: 1.1rem; margin-top: 0.5rem; }
.strat-desc { color: var(--color-text-muted); font-size: 0.85rem; margin-top: 0.25rem; }
.expand-icon { color: var(--color-text-dim); font-size: 0.85rem; flex-shrink: 0; margin-left: 1rem; }

.strat-content {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  cursor: default;
}

.strat-body h4 {
  font-size: 1rem;
  color: var(--color-gold);
  margin-bottom: 0.5rem;
  margin-top: 1.25rem;
}
.strat-body h4:first-child { margin-top: 0; }

.strat-body p { color: var(--color-text); line-height: 1.6; }
.strat-body ol, .strat-body ul { padding-left: 1.25rem; }
.strat-body li { margin-bottom: 0.5rem; color: var(--color-text); line-height: 1.5; }

.loading-state { text-align: center; padding: 3rem; }
.loading-state .spinner { margin: 0 auto; }
</style>
